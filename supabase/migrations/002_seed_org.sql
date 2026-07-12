-- Seed the demo organization, departments, branches, designations, and policies.
-- Run this in Supabase Dashboard → SQL Editor AFTER 001_schema.sql.
-- This does not depend on any auth users existing yet.

insert into public.organizations (name, industry, size, website, business_hours_start, business_hours_end, timezone)
values (
  'Desi Manager Pvt. Ltd.',
  'Retail & E-commerce',
  '100-250 employees',
  'www.desimanager.ai',
  '09:00',
  '18:00',
  'Asia/Kolkata (IST)'
);

insert into public.departments (org_id, name, head, employee_count)
select id, d.name, d.head, d.employee_count
from public.organizations, (values
  ('Executive', 'Aarav Shah', 4),
  ('Operations', 'Priya Nair', 22),
  ('Sales', 'Rohan Mehta', 34),
  ('Customer Support', 'Simran Kaur', 28),
  ('HR', 'Neha Kapoor', 8),
  ('Products', 'Vikram Singh', 12)
) as d(name, head, employee_count);

insert into public.branches (org_id, name, city, employee_count)
select id, b.name, b.city, b.employee_count
from public.organizations, (values
  ('Mumbai HQ', 'Mumbai', 64),
  ('Delhi Office', 'Delhi', 38),
  ('Bangalore Office', 'Bangalore', 26)
) as b(name, city, employee_count);

insert into public.designations (org_id, title)
select id, t.title
from public.organizations, (values
  ('Software Engineer'),
  ('Sales Executive'),
  ('Customer Support Associate'),
  ('HR Manager'),
  ('Operations Lead'),
  ('Product Manager')
) as t(title);

insert into public.company_policies (org_id, title, updated_at)
select id, p.title, now() - p.age
from public.organizations, (values
  ('Leave Policy 2026', interval '2 weeks'),
  ('Code of Conduct', interval '1 month'),
  ('Remote Work Policy', interval '3 months')
) as p(title, age);
