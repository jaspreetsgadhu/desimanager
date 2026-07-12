-- Desi Manager — core schema, RLS, and auto-profile trigger
-- Run this once in Supabase Dashboard → SQL Editor.

-- Enums
create type user_role as enum ('super_admin', 'admin', 'manager', 'employee');
create type employee_status as enum ('active', 'invited', 'inactive');
create type document_type as enum ('PDF', 'DOC', 'Video', 'URL');

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  size text,
  website text,
  business_hours_start text,
  business_hours_end text,
  timezone text,
  created_at timestamptz not null default now()
);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null default 'employee',
  department text,
  designation text,
  reporting_manager text,
  status employee_status not null default 'active',
  created_at timestamptz not null default now()
);
create index profiles_org_id_idx on public.profiles(org_id);

-- Departments
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  head text,
  employee_count int not null default 0
);
create index departments_org_id_idx on public.departments(org_id);

-- Branches
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  city text,
  employee_count int not null default 0
);
create index branches_org_id_idx on public.branches(org_id);

-- Designations
create table public.designations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null
);
create index designations_org_id_idx on public.designations(org_id);

-- Company policies
create table public.company_policies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  updated_at timestamptz not null default now()
);
create index company_policies_org_id_idx on public.company_policies(org_id);

-- Knowledge base documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  category text,
  type document_type not null default 'PDF',
  size text,
  storage_path text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index documents_org_id_idx on public.documents(org_id);

-- Helper functions (security definer so they can read profiles under RLS)
create or replace function public.current_org_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('admin', 'super_admin'), false)
$$;

-- Auto-create a profile row whenever a new auth user signs up.
-- Assigns every new signup to the single seeded demo organization.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  demo_org_id uuid;
begin
  select id into demo_org_id from public.organizations order by created_at asc limit 1;

  insert into public.profiles (id, org_id, name, email, role, department, designation, reporting_manager, status)
  values (
    new.id,
    demo_org_id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'employee'),
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'designation',
    new.raw_user_meta_data->>'reporting_manager',
    coalesce((new.raw_user_meta_data->>'status')::employee_status, 'active')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.branches enable row level security;
alter table public.designations enable row level security;
alter table public.company_policies enable row level security;
alter table public.documents enable row level security;

-- Organizations: any org member can read; only admins can update.
create policy "org members read" on public.organizations
  for select using (id = public.current_org_id());
create policy "org admins update" on public.organizations
  for update using (id = public.current_org_id() and public.is_admin());

-- Profiles: any org member can read coworkers; admins manage all; users update their own row.
create policy "profiles org read" on public.profiles
  for select using (org_id = public.current_org_id());
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid() or (org_id = public.current_org_id() and public.is_admin()));
create policy "profiles admin insert" on public.profiles
  for insert with check (org_id = public.current_org_id() and public.is_admin());
create policy "profiles admin delete" on public.profiles
  for delete using (org_id = public.current_org_id() and public.is_admin());

-- Departments / Branches / Designations / Policies: org-wide read, admin write.
create policy "departments org read" on public.departments
  for select using (org_id = public.current_org_id());
create policy "departments admin write" on public.departments
  for all using (org_id = public.current_org_id() and public.is_admin())
  with check (org_id = public.current_org_id() and public.is_admin());

create policy "branches org read" on public.branches
  for select using (org_id = public.current_org_id());
create policy "branches admin write" on public.branches
  for all using (org_id = public.current_org_id() and public.is_admin())
  with check (org_id = public.current_org_id() and public.is_admin());

create policy "designations org read" on public.designations
  for select using (org_id = public.current_org_id());
create policy "designations admin write" on public.designations
  for all using (org_id = public.current_org_id() and public.is_admin())
  with check (org_id = public.current_org_id() and public.is_admin());

create policy "policies org read" on public.company_policies
  for select using (org_id = public.current_org_id());
create policy "policies admin write" on public.company_policies
  for all using (org_id = public.current_org_id() and public.is_admin())
  with check (org_id = public.current_org_id() and public.is_admin());

-- Documents: org-wide read; any org member can upload; uploader or admin can modify/delete.
create policy "documents org read" on public.documents
  for select using (org_id = public.current_org_id());
create policy "documents member insert" on public.documents
  for insert with check (org_id = public.current_org_id());
create policy "documents owner or admin update" on public.documents
  for update using (
    org_id = public.current_org_id()
    and (uploaded_by = auth.uid() or public.is_admin())
  );
create policy "documents owner or admin delete" on public.documents
  for delete using (
    org_id = public.current_org_id()
    and (uploaded_by = auth.uid() or public.is_admin())
  );
