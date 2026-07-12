-- RAG pipeline schema: pgvector, document chunks, similarity search RPC.

create extension if not exists vector;

alter table public.documents
  add column if not exists indexed_at timestamptz,
  add column if not exists index_status text not null default 'not_indexed';
-- index_status: 'not_indexed' | 'indexing' | 'indexed' | 'failed'

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);
create index document_chunks_org_id_idx on public.document_chunks(org_id);
create index document_chunks_document_id_idx on public.document_chunks(document_id);
create index document_chunks_embedding_idx on public.document_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.document_chunks enable row level security;

create policy "document_chunks org read" on public.document_chunks
  for select using (org_id = public.current_org_id());

-- Inserts/deletes happen server-side via the service role key (ingestion route),
-- which bypasses RLS entirely, so no insert/delete policy is needed for regular users.

-- Similarity search RPC: returns the top-N chunks (with parent document metadata)
-- closest to a query embedding, scoped to one organization.
create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_org_id uuid,
  match_count int default 6
)
returns table (
  chunk_id uuid,
  document_id uuid,
  document_title text,
  document_category text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    dc.id as chunk_id,
    dc.document_id,
    d.title as document_title,
    d.category as document_category,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where dc.org_id = match_org_id
  order by dc.embedding <=> query_embedding
  limit match_count
$$;
