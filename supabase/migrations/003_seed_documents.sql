-- Seed knowledge base documents, linking uploaded_by to the seeded profiles.
-- Run this in Supabase Dashboard → SQL Editor AFTER running scripts/seed-users.mjs
-- (profiles must already exist for the email lookups below to resolve).

insert into public.documents (org_id, title, category, type, size, uploaded_by, updated_at)
select
  o.id,
  d.title,
  d.category,
  d.type::document_type,
  d.size,
  p.id,
  now() - d.age
from public.organizations o
cross join (values
  ('Employee Handbook.pdf', 'HR', 'PDF', '2.4 MB', 'neha@desimanager.ai', interval '2 days'),
  ('Leave Policy 2026.pdf', 'HR', 'PDF', '1.1 MB', 'priya@desimanager.ai', interval '10 minutes'),
  ('Sales SOP.docx', 'Sales', 'DOC', '860 KB', 'rohan@desimanager.ai', interval '5 days'),
  ('Refund Policy.pdf', 'Customer Support', 'PDF', '540 KB', 'simran@desimanager.ai', interval '7 days'),
  ('Product Manual v3.pdf', 'Products', 'PDF', '4.7 MB', 'vikram@desimanager.ai', interval '14 days'),
  ('Onboarding Walkthrough.mp4', 'Training', 'Video', '58 MB', 'neha@desimanager.ai', interval '21 days'),
  ('Company Website FAQ', 'Operations', 'URL', null, 'aarav@desimanager.ai', interval '30 days')
) as d(title, category, type, size, uploader_email, age)
join public.profiles p on p.email = d.uploader_email;
