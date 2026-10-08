-- Map images get their own bucket: they are larger than portraits, which stay
-- at 2 MB in world-images. The browser converts every map to WebP before
-- uploading, so WebP is the only type accepted.
--
-- Public like the other image buckets. Files live under
-- "<campaign id>/<entry id>/", and the entry id is only known to people who
-- can see the entry, so a hidden map's URL cannot be guessed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'world-maps',
  'world-maps',
  true,
  10485760,
  array['image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "World maps are publicly readable"
  on storage.objects for select
  using (bucket_id = 'world-maps');

-- The first folder is the campaign id, which has_permission_for_folder reads.
create policy "World managers can upload world maps"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'world-maps'
    and public.has_permission_for_folder(name, 'manage_world')
  );

create policy "World managers can update world maps"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'world-maps'
    and public.has_permission_for_folder(name, 'manage_world')
  );

create policy "World managers can delete world maps"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'world-maps'
    and public.has_permission_for_folder(name, 'manage_world')
  );
