-- Maps in a library. A library map is a map entry with owner_id set: it keeps
-- its image and, when it was built in the builder, its scene. Pins are never
-- copied, so a library map has none and cannot get any (add_map_marker still
-- only accepts campaign maps).

alter table public.world_entries
  drop constraint world_entries_library_not_map;

create or replace function public.create_library_entry(
  entry_kind public.world_entry_kind,
  entry_name text
)
returns public.world_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.world_entries;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if trim(entry_name) = '' then
    raise exception 'Give the entry a name.';
  end if;

  insert into public.world_entries (kind, name, owner_id, created_by, sort_order)
  values (
    entry_kind,
    trim(entry_name),
    auth.uid(),
    auth.uid(),
    coalesce(
      (select min(sort_order) from public.world_entries where owner_id = auth.uid()),
      1
    ) - 1
  )
  returning * into created;

  return created;
end;
$$;

-- ---------------------------------------------------------------------------
-- Scenes: the owner of a library map manages it like a GM manages a campaign's
-- ---------------------------------------------------------------------------

drop policy "World managers read map scenes" on public.world_map_scenes;

create policy "World managers read map scenes"
  on public.world_map_scenes for select
  using (public.can_manage_entry(map_id));

create or replace function public.save_map_scene(
  target_map uuid,
  new_scene jsonb,
  expected_updated_at timestamptz default null,
  mark_rendered boolean default false
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  map_kind public.world_entry_kind;
  current_updated timestamptz;
  saved timestamptz := clock_timestamp();
begin
  if not public.can_manage_entry(target_map) then
    raise exception 'You are not allowed to change this map.';
  end if;

  select kind into map_kind from public.world_entries where id = target_map;

  if map_kind <> 'map' then
    raise exception 'That entry is not a map.';
  end if;

  if jsonb_typeof(new_scene) <> 'object'
     or jsonb_typeof(new_scene -> 'version') <> 'number' then
    raise exception 'That is not a map scene.';
  end if;

  -- A few megabytes is plenty of shapes; this only stops runaway documents.
  if octet_length(new_scene::text) > 8 * 1024 * 1024 then
    raise exception 'This scene is too large to save.';
  end if;

  select updated_at into current_updated
  from public.world_map_scenes where map_id = target_map for update;

  if not found then
    if expected_updated_at is not null then
      raise exception 'This map was changed somewhere else. Reload it to continue.';
    end if;

    insert into public.world_map_scenes
      (map_id, scene, scene_version, updated_at, updated_by, rendered_at)
    values (
      target_map,
      new_scene,
      (new_scene ->> 'version')::integer,
      saved,
      auth.uid(),
      case when mark_rendered then saved end
    );
  else
    if expected_updated_at is distinct from current_updated then
      raise exception 'This map was changed somewhere else. Reload it to continue.';
    end if;

    update public.world_map_scenes
    set scene = new_scene,
        scene_version = (new_scene ->> 'version')::integer,
        updated_at = saved,
        updated_by = auth.uid(),
        rendered_at = case when mark_rendered then saved else rendered_at end
    where map_id = target_map;
  end if;

  -- Only a published map changes what everyone sees.
  if mark_rendered then
    update public.world_entries set updated_at = now() where id = target_map;
  end if;

  return saved;
end;
$$;

create or replace function public.discard_map_scene(target_map uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_entry(target_map) then
    raise exception 'You are not allowed to change this map.';
  end if;

  delete from public.world_map_scenes where map_id = target_map;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: world-maps follows the same folder rule as world-images. Reading
-- needs no change: the bucket is public.
-- ---------------------------------------------------------------------------

drop policy "World managers can upload world maps" on storage.objects;
drop policy "World managers can update world maps" on storage.objects;
drop policy "World managers can delete world maps" on storage.objects;

create policy "World managers can upload world maps"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'world-maps' and public.has_world_folder_access(name));

create policy "World managers can update world maps"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'world-maps' and public.has_world_folder_access(name));

create policy "World managers can delete world maps"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'world-maps' and public.has_world_folder_access(name));

-- ---------------------------------------------------------------------------
-- Copying: as before, but a map's image is in world-maps, its scene is copied,
-- and its markers are not.
-- ---------------------------------------------------------------------------

create or replace function public.copy_world_entry(
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
  image_bucket text;
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

  image_bucket := case when source.kind = 'map' then 'world-maps' else 'world-images' end;

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
      where bucket_id = image_bucket and name = new_image_path
    ) then
      raise exception 'The image file was not found.';
    end if;

    if right(source_url, char_length('/' || image_bucket || '/' || source_path))
       is distinct from '/' || image_bucket || '/' || source_path then
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

  -- The builder scene only holds shapes and bundled art, so it is copied as it
  -- is. Markers, and the maps they open, are left behind on purpose.
  insert into public.world_map_scenes
    (map_id, scene, scene_version, updated_at, updated_by, rendered_at)
  select
    new_entry_id, s.scene, s.scene_version, clock_timestamp(), auth.uid(),
    case when s.rendered_at is not null then clock_timestamp() end
  from public.world_map_scenes s
  where s.map_id = source_entry;

  select * into created from public.world_entries where id = new_entry_id;
  return created;
end;
$$;
