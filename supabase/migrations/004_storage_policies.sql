-- Storage RLS for the 'documents' bucket.
-- Any authenticated org member can upload/read; only the uploader or an admin can delete.

create policy "documents bucket authenticated read"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "documents bucket authenticated insert"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "documents bucket owner or admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (owner = auth.uid() or public.is_admin())
  );
