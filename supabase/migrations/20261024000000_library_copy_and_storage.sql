-- Library storage and copying an entry between a library and a campaign.

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- Library images live under "<user id>/<entry id>/", campaign images under
-- "<campaign id>/<entry id>/". A user id can never be a campaign id, so one
-- check covers both.
create function public.has_world_folder_access(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (storage.foldername(object_name))[1] = auth.uid()::text
    or public.has_permission_for_folder(object_name, 'manage_world');
$$;

-- Maps cannot be in a library yet, so world-maps keeps its campaign-only policies.
drop policy "World managers can upload world images" on storage.objects;
drop policy "World managers can update world images" on storage.objects;
drop policy "World managers can delete world images" on storage.objects;

create policy "World managers can upload world images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'world-images'
    and public.has_world_folder_access(name)
  );

create policy "World managers can update world images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'world-images'
    and public.has_world_folder_access(name)
  );

create policy "World managers can delete world images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'world-images'
    and public.has_world_folder_access(name)
  );

-- ---------------------------------------------------------------------------
-- Copying
-- ---------------------------------------------------------------------------

-- Copies one entry between the caller's library and a campaign they manage:
-- from a campaign into the library (target_campaign null), or from the library
-- into a campaign.
--
-- The app copies the image file first and passes its path in new_image_path;
-- a failure in between leaves a stray file, never an entry with a missing
-- image. The path must sit in the new entry's own folder and the file must
-- exist. The new URL is built from the source's URL, so the app cannot point
-- an entry at an address of its own.
--
-- What the copy keeps and drops:
--   * The copy is never revealed.
--   * Private flags are kept, so a secret stays secret once the copy is revealed.
--   * A stat block starts at full health: healthCurrent is dropped.
--   * A template's shared portrait (no path) is shared, not copied.
create function public.copy_world_entry(
  source_entry uuid,
  new_entry_id uuid,
  target_campaign uuid default null,
  new_image_path text default null
)
returns public.world_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  source public.world_entries;
  target_folder text;
  folder_prefix text;
  source_image jsonb;
  source_path text;
  source_url text;
  new_url text;
  created public.world_entries;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select * into source from public.world_entries where id = source_entry;

  if not found or not public.can_manage_entry(source_entry) then
    raise exception 'You are not allowed to copy this entry.';
  end if;

  if source.kind = 'map' then
    raise exception 'Maps cannot be copied yet.';
  end if;

  if source.owner_id is not null then
    if target_campaign is null then
      raise exception 'Add library entries to a campaign.';
    end if;

    if not public.has_campaign_permission(target_campaign, 'manage_world') then
      raise exception 'You are not allowed to add to this world.';
    end if;

    target_folder := target_campaign::text;
  else
    if target_campaign is not null then
      raise exception 'Save campaign entries to your library first.';
    end if;

    target_folder := auth.uid()::text;
  end if;

  if exists (select 1 from public.world_entries where id = new_entry_id) then
    raise exception 'That entry already exists.';
  end if;

  select f.value into source_image
  from public.world_entry_fields f
  where f.entry_id = source_entry and f.key = 'image' and f.type = 'image';

  source_path := source_image ->> 'path';
  source_url := source_image ->> 'url';

  -- Only the cover image is known to the app; another image field with a file
  -- would be shared with the original.
  if exists (
    select 1 from public.world_entry_fields f
    where f.entry_id = source_entry and f.type = 'image' and f.key <> 'image'
      and f.value ->> 'path' is not null
  ) then
    raise exception 'This entry has an image that cannot be copied.';
  end if;

  if source_path is null then
    if new_image_path is not null then
      raise exception 'This entry has no image file to copy.';
    end if;
  else
    folder_prefix := target_folder || '/' || new_entry_id::text || '/';

    if new_image_path is null then
      raise exception 'Copy the image file first.';
    end if;

    if left(new_image_path, char_length(folder_prefix)) <> folder_prefix
       or char_length(new_image_path) = char_length(folder_prefix)
       or position('/' in substr(new_image_path, char_length(folder_prefix) + 1)) > 0
       or position('..' in new_image_path) > 0 then
      raise exception 'The image is not in the right folder.';
    end if;

    if not exists (
      select 1 from storage.objects
      where bucket_id = 'world-images' and name = new_image_path
    ) then
      raise exception 'The image file was not found.';
    end if;

    if right(source_url, char_length('/world-images/' || source_path))
       is distinct from '/world-images/' || source_path then
      raise exception 'This entry has an image that cannot be copied.';
    end if;

    new_url := left(source_url, char_length(source_url) - char_length(source_path))
      || new_image_path;
  end if;

  insert into public.world_entries (
    id, kind, name, campaign_id, owner_id, created_by, sort_order, source_entry_id
  )
  values (
    new_entry_id,
    source.kind,
    source.name,
    target_campaign,
    case when target_campaign is null then auth.uid() end,
    auth.uid(),
    coalesce(
      (
        select min(e.sort_order) from public.world_entries e
        where case
          when target_campaign is null then e.owner_id = auth.uid()
          else e.campaign_id = target_campaign
        end
      ),
      1
    ) - 1,
    source_entry
  );

  insert into public.world_entry_fields (entry_id, key, type, value, private)
  select
    new_entry_id,
    f.key,
    f.type,
    case
      when f.type = 'stat_block' and jsonb_typeof(f.value) = 'object'
        then f.value - 'healthCurrent'
      when f.key = 'image' and f.type = 'image' and source_path is not null
        then jsonb_set(jsonb_set(f.value, '{url}', to_jsonb(new_url)), '{path}', to_jsonb(new_image_path))
      else f.value
    end,
    f.private
  from public.world_entry_fields f
  where f.entry_id = source_entry;

  select * into created from public.world_entries where id = new_entry_id;
  return created;
end;
$$;

revoke execute on function
  public.has_world_folder_access(text),
  public.copy_world_entry(uuid, uuid, uuid, text)
from public, anon;

grant execute on function
  public.has_world_folder_access(text),
  public.copy_world_entry(uuid, uuid, uuid, text)
to authenticated;
