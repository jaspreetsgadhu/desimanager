export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOpenAI, EMBEDDING_MODEL, CHAT_MODEL } from "@/lib/openai";

// Unauthenticated customer-facing chat. Customers have no Supabase session, so
// this route uses the service-role admin client for both org resolution and
// retrieval instead of the per-user client the employee /api/chat route uses.
// Only ever expose customer-safe personas here — never buddy/hr/reporter.
const CUSTOMER_AGENT_PERSONAS: Record<string, string> = {
  "install-help":
    "You are Product Installation Help AI. You help customers install and set up products they have purchased, using the company's installation guides and manuals. Be clear, patient, and step-by-step. If asked about anything unrelated to installation or setup, politely suggest they use Submit a Complaint instead.",
  complaint:
    "You are Complaint Assistant AI. You help a customer clearly describe a problem they are having with a product or order, so they can submit an accurate complaint. Ask brief clarifying questions if needed (what product, when it happened, what went wrong). Once you have enough detail, respond with ONLY the draft complaint description itself — 2-4 plain sentences, first person, no heading, no label like 'Here is a draft', no quotation marks, no closing remarks like 'feel free to use this' — because your entire reply gets copied directly into the complaint form. You do not resolve complaints, issue refunds, or make promises on the company's behalf — you only help them articulate the issue.",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const agent = typeof body?.agent === "string" ? body.agent : "install-help";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  const admin = createAdminClient();

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!org) {
    console.error("Org lookup failed:", orgError);
    const msg = orgError?.message ?? "No organization configured";
    return new Response(`Org lookup failed: ${msg}`, { status: 400 });
  }

  let relevantMatches: { document_title: string; document_category: string | null; content: string }[] =
    [];
  let contextBlock = "No relevant documents were found in the knowledge base for this question.";

  let queryEmbedding: number[];
  try {
    const embeddingRes = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: message,
    });
    queryEmbedding = embeddingRes.data[0].embedding;
  } catch (err) {
    console.error("Embeddings call failed:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Embeddings failed: ${msg}`, { status: 502 });
  }

  try {
    const { data: matches, error: rpcError } = await admin.rpc("match_document_chunks", {
      query_embedding: queryEmbedding,
      match_org_id: org.id,
      match_count: 6,
    });

    if (rpcError) {
      console.error("match_document_chunks RPC error:", rpcError);
    }

    relevantMatches = (matches ?? []).filter((m) => m.similarity > 0.3);
    if (relevantMatches.length > 0) {
      contextBlock = relevantMatches
        .map((m, i) => `[${i + 1}] Source: ${m.document_title}\n${m.content}`)
        .join("\n\n");
    }
  } catch (err) {
    console.error("Retrieval RPC step failed:", err);
    const msg = err instanceof Error ? err.message : "Unknown error during retrieval";
    return new Response(`Retrieval RPC failed: ${msg}`, { status: 502 });
  }

  const persona = CUSTOMER_AGENT_PERSONAS[agent] ?? CUSTOMER_AGENT_PERSONAS["install-help"];
  const systemPrompt = `${persona}

Answer the customer's question using ONLY the context below, drawn from the company's knowledge base. If the context does not contain the answer, say you don't have that information yet — do not make something up. Keep answers concise (2-4 sentences unless more detail is clearly needed). Reference source documents naturally by name when relevant.

Context:
${contextBlock}`;

  const citations = relevantMatches
    .map((m) => ({ title: m.document_title, category: m.document_category ?? "" }))
    .filter((c, i, arr) => arr.findIndex((x) => x.title === c.title) === i);

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...history.slice(-6),
    { role: "user" as const, content: message },
  ];

  let stream;
  try {
    stream = await getOpenAI().chat.completions.create({
      model: CHAT_MODEL,
      messages: chatMessages,
      stream: true,
    });
  } catch (err) {
    console.error("Chat completion failed:", err);
    const msg = err instanceof Error ? err.message : "Unknown error calling OpenAI";
    return new Response(msg, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        console.error("Streaming failed:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Citations": encodeURIComponent(JSON.stringify(citations)),
    },
  });
}
