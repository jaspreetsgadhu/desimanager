import OpenAI from "openai";

let client: OpenAI | null = null;

// Lazily instantiated so the API key is only read at request time, not during
// Next.js's build-time page-data collection (which runs before env vars from
// the hosting platform are necessarily available to module-scope code).
export function getOpenAI() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const CHAT_MODEL = "gpt-4o-mini";
