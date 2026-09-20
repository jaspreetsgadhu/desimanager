-- Employee leave requests, applied by an authenticated employee and
-- approved/rejected by a manager/admin/super_admin in the same org.
-- Standard client-side RLS (unlike complaints, which are written by
-- unauthenticated customers via the service-role key).

create type leave_status as enum ('pending', 'approved', 'rejected');

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  employee_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  days integer not null check (days > 0),
  reason text not null,
  status leave_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leave_requests_org_id_idx on public.leave_requests(org_id);
create index leave_requests_employee_id_idx on public.leave_requests(employee_id);
create index leave_requests_status_idx on public.leave_requests(status);

alter table public.leave_requests enable row level security;

create policy "leave_requests self read" on public.leave_requests
  for select using (employee_id = auth.uid());
create policy "leave_requests self insert" on public.leave_requests
  for insert with check (employee_id = auth.uid() and org_id = public.current_org_id());

create policy "leave_requests org read for managers" on public.leave_requests
  for select using (
    org_id = public.current_org_id()
    and public.current_role() in ('manager', 'admin', 'super_admin')
  );
create policy "leave_requests manager update" on public.leave_requests
  for update using (
    org_id = public.current_org_id()
    and public.current_role() in ('manager', 'admin', 'super_admin')
  );
