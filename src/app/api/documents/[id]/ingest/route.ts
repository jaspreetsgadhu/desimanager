export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chunkText } from "@/lib/chunk-text";
import { getOpenAI, EMBEDDING_MODEL } from "@/lib/openai";

async function extractText(buffer: Buffer, type: string): Promise<string | null> {
  if (type === "PDF") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  if (type === "DOC") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  return null;
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: doc, error: docError } = await admin
    .from("documents")
    .select("id, org_id, title, type, storage_path")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!doc.storage_path) {
    return NextResponse.json({ error: "Document has no file attached" }, { status: 400 });
  }

  await admin.from("documents").update({ index_status: "indexing" }).eq("id", id);

  try {
    const { data: fileBlob, error: downloadError } = await admin.storage
      .from("documents")
      .download(doc.storage_path);
    if (downloadError || !fileBlob) {
      throw new Error(downloadError?.message ?? "Could not download file");
    }

    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const text = await extractText(buffer, doc.type);

    if (!text || text.trim().length === 0) {
      await admin.from("documents").update({ index_status: "failed" }).eq("id", id);
      return NextResponse.json(
        { error: `Text extraction is not supported for ${doc.type} documents yet` },
        { status: 422 }
      );
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      await admin.from("documents").update({ index_status: "failed" }).eq("id", id);
      return NextResponse.json({ error: "No extractable text found" }, { status: 422 });
    }

    const embeddingResponse = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: chunks,
    });

    await admin.from("document_chunks").delete().eq("document_id", id);

    const rows = chunks.map((content, i) => ({
      document_id: id,
      org_id: doc.org_id,
      chunk_index: i,
      content,
      embedding: embeddingResponse.data[i].embedding,
    }));

    const { error: insertError } = await admin.from("document_chunks").insert(rows);
    if (insertError) throw new Error(insertError.message);

    await admin
      .from("documents")
      .update({ index_status: "indexed", indexed_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true, chunksIndexed: rows.length });
  } catch (err) {
    await admin.from("documents").update({ index_status: "failed" }).eq("id", id);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
