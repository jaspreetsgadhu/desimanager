export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, EMBEDDING_MODEL, CHAT_MODEL } from "@/lib/openai";

const AGENT_PERSONAS: Record<string, string> = {
  buddy:
    "You are Buddy AI, the friendly central AI assistant for the company. You answer questions on any topic covered in the knowledge base, spanning HR, training, customer care, and general company topics.",
  hr: "You are HR Manager AI. You specialize in leave policy, attendance, holidays, benefits, and HR processes.",
  training:
    "You are Training Manager AI. You specialize in onboarding, SOP learning, product training, quizzes, and certifications.",
  "customer-care":
    "You are Customer Care AI. You specialize in product FAQs, refund/return policy, escalation processes, and customer support.",
  reporter:
    "You are Reporter AI. You specialize in summarizing organizational usage and analytics. You do not have access to live analytics data in this conversation, so say so if asked for real-time numbers rather than inventing figures.",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const agent = typeof body?.agent === "string" ? body.agent : "buddy";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return new Response("No organization found for this user", { status: 400 });
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
    const keyLen = process.env.OPENAI_API_KEY?.length ?? 0;
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Embeddings failed (OPENAI_API_KEY length=${keyLen}): ${msg}`, { status: 502 });
  }

  try {
    const { data: matches, error: rpcError } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmbedding,
      match_org_id: profile.org_id,
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

  const persona = AGENT_PERSONAS[agent] ?? AGENT_PERSONAS.buddy;
  const systemPrompt = `${persona}

Answer the employee's question using ONLY the context below, drawn from the company's knowledge base. If the context does not contain the answer, say you don't have that information in the knowledge base yet — do not make something up. Keep answers concise (2-4 sentences unless more detail is clearly needed). Reference source documents naturally by name when relevant.

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
