// One-time setup: creates a private Storage bucket for knowledge base document uploads.
// Usage: node scripts/create-storage-bucket.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.storage.createBucket("documents", {
  public: false,
  fileSizeLimit: "50MB",
});

if (error) {
  if (error.message.includes("already exists")) {
    console.log("Bucket 'documents' already exists — nothing to do.");
  } else {
    console.error("✗", error.message);
    process.exit(1);
  }
} else {
  console.log("✓ Created private bucket:", data.name);
}
