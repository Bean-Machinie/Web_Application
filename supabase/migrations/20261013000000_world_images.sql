-- Images for world entries: an 'image' field type and a bucket to hold the
-- files.
--
-- An image field is a row in world_entry_fields whose value is
-- { "url": ..., "path": ... }, so reading and writing it needs no new policy
-- or function.

alter type public.world_field_type add value 'image';

-- Public like the other image buckets. Files live under
-- "<campaign id>/<entry id>/", and the entry id is only known to people who
-- can see the entry, so a hidden entry's image URL cannot be guessed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'world-images',
  'world-images',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "World images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'world-images');

-- The first folder is the campaign id, which has_permission_for_folder reads.
create policy "World managers can upload world images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'world-images'
    and public.has_permission_for_folder(name, 'manage_world')
  );

create policy "World managers can update world images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'world-images'
    and public.has_permission_for_folder(name, 'manage_world')
  );

create policy "World managers can delete world images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'world-images'
    and public.has_permission_for_folder(name, 'manage_world')
  );
