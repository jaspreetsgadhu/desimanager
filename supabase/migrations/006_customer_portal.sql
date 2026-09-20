-- Customer-facing complaints: submitted by unauthenticated customers via the
-- customer portal, written server-side with the service-role key (see
-- src/app/api/complaints/route.ts). No insert policy is granted to
-- anon/authenticated roles — same service-role-bypass pattern used for
-- document_chunks in 005_rag_schema.sql.

create type complaint_status as enum ('open', 'in_progress', 'resolved');
create type complaint_category as enum ('product_defect', 'delivery', 'billing', 'warranty', 'other');

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  customer_name text not null,
  customer_contact text not null,
  category complaint_category not null default 'other',
  description text not null,
  status complaint_status not null default 'open',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index complaints_org_id_idx on public.complaints(org_id);
create index complaints_status_idx on public.complaints(status);

alter table public.complaints enable row level security;

create policy "complaints org read" on public.complaints
  for select using (org_id = public.current_org_id());

create policy "complaints admin manager update" on public.complaints
  for update using (
    org_id = public.current_org_id()
    and public.current_role() in ('admin', 'super_admin', 'manager')
  );

-- No insert policy: rows are written exclusively via the service-role key
-- from src/app/api/complaints/route.ts, which bypasses RLS entirely.
