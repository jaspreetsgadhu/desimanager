# Desi Manager

AI Workforce & Knowledge Operating System — a prototype built with Next.js, Supabase, and OpenAI.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, pgvector)
- **AI:** OpenAI (`text-embedding-3-small` for embeddings, `gpt-4o-mini` for chat) with a real RAG pipeline over uploaded knowledge base documents
- **Testing:** Playwright

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

- Supabase URL/keys: Project Settings → API in your Supabase dashboard.
- OpenAI key: platform.openai.com → API keys (billing must be enabled).

### 3. Run database migrations

In the Supabase Dashboard → SQL Editor, run the files in `supabase/migrations/` **in order** (001 through 005).

### 4. Seed demo data (optional)

```bash
node scripts/seed-users.mjs           # creates 8 demo employee accounts
node scripts/create-storage-bucket.mjs # creates the 'documents' storage bucket
```

All seeded demo accounts share the password `DemoPass123!`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm run test:e2e
```

## Project structure

- `src/app/(app)/` — authenticated app pages (Dashboard, AI Workspace, Knowledge Base, Employees, Organization, HR, Training, Customer Care, Reports, Settings)
- `src/app/api/` — server routes (`/api/chat` for RAG chat, `/api/documents/[id]/ingest` for document indexing)
- `src/lib/supabase/` — Supabase client (browser, server, admin) and generated types
- `supabase/migrations/` — SQL schema, RLS policies, and seed data, run manually via the Supabase SQL Editor
- `scripts/` — one-time setup scripts (user seeding, storage bucket creation)
