-- Pins travel with maps. Library maps can have pins that link to library
-- entries, and copying a map can bring its pins, the entries they link, and
-- those entries' own pins, recursively. An entry that already has a copy in the
-- target (in either direction, through source_entry_id) is linked, not copied.

-- ---------------------------------------------------------------------------
-- Pins in a library: the same functions, with "who may change this map" asked
-- of can_manage_entry, and a pin only linking an entry from the map's own home
-- (its campaign, or its owner's library).
-- ---------------------------------------------------------------------------

create or replace function public.add_map_marker(
  target_map uuid,
  linked_entry uuid,
  pos_x real,
  pos_y real
)
returns public.world_map_markers
language plpgsql
security definer
set search_path = ''
as $$
declare
  map_row public.world_entries;
  linked_row public.world_entries;
  created public.world_map_markers;
begin
  if not public.can_manage_entry(target_map) then
    raise exception 'You are not allowed to change this map.';
  end if;

  select * into map_row from public.world_entries where id = target_map;

  if map_row.kind <> 'map' then
    raise exception 'That entry is not a map.';
  end if;

  if target_map = linked_entry then
    raise exception 'A map cannot be pinned to itself.';
  end if;

  select * into linked_row from public.world_entries where id = linked_entry;

  if not found
     or linked_row.campaign_id is distinct from map_row.campaign_id
     or linked_row.owner_id is distinct from map_row.owner_id then
    raise exception 'That entry does not belong to this %.',
      case when map_row.owner_id is null then 'campaign' else 'library' end;
  end if;

  if pos_x not between 0 and 100 or pos_y not between 0 and 100 then
    raise exception 'That spot is outside the map.';
  end if;

  insert into public.world_map_markers (map_id, entry_id, x, y, created_by)
  values (target_map, linked_entry, pos_x, pos_y, auth.uid())
  returning * into created;

  update public.world_entries set updated_at = now() where id = target_map;

  return created;
end;
$$;

create or replace function public.move_map_marker(target_marker uuid, pos_x real, pos_y real)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  on_map uuid;
begin
  select map_id into on_map from public.world_map_markers where id = target_marker;

  if on_map is null or not public.can_manage_entry(on_map) then
    raise exception 'You are not allowed to change this map.';
  end if;

  if pos_x not between 0 and 100 or pos_y not between 0 and 100 then
    raise exception 'That spot is outside the map.';
  end if;

  update public.world_map_markers set x = pos_x, y = pos_y where id = target_marker;
  update public.world_entries set updated_at = now() where id = on_map;
end;
$$;

create or replace function public.remove_map_marker(target_marker uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  on_map uuid;
begin
  select map_id into on_map from public.world_map_markers where id = target_marker;

  if on_map is null or not public.can_manage_entry(on_map) then
    raise exception 'You are not allowed to change this map.';
  end if;

  delete from public.world_map_markers where id = target_marker;
  update public.world_entries set updated_at = now() where id = on_map;
end;
$$;

-- ---------------------------------------------------------------------------
-- Planning
-- ---------------------------------------------------------------------------

-- The copy of an entry that already sits in the target: a copy made from it, or
-- the entry it was itself copied from. The oldest if there are several; null
-- if none. Target null is the caller's library.
create function public.existing_copy_in(entry_id uuid, target_campaign uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.id
  from public.world_entries t
  where case
          when target_campaign is null then t.owner_id = auth.uid()
          else t.campaign_id = target_campaign
        end
    and (
      t.source_entry_id = entry_id
      or t.id = (select s.source_entry_id from public.world_entries s where s.id = entry_id)
    )
  order by t.created_at, t.id
  limit 1;
$$;

-- Everything a copy of these maps reaches: the maps, the entries their pins
-- link, and the pins of linked maps, recursively. An entry that has a copy in
-- the target is listed but not followed. The union drops repeats, which is
-- also what ends a cycle.
--
-- The answer depends on what is in the target, so anything that copies must
-- take it once, before the first copy is made.
create function public.map_copy_closure(source_maps uuid[], target_campaign uuid)
returns table (source_id uuid, is_root boolean, existing_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
  with recursive reach (id) as (
    select unnest(source_maps)
    union
    select m.entry_id
    from reach r
    join public.world_map_markers m on m.map_id = r.id
    where r.id = any (source_maps)
       or public.existing_copy_in(r.id, target_campaign) is null
  )
  select
    r.id,
    r.id = any (source_maps),
    case when r.id = any (source_maps)
      then null
      else public.existing_copy_in(r.id, target_campaign)
    end
  from reach r;
end;
$$;

-- Every rule a map copy must meet, in one place. Library maps go to a campaign
-- the caller manages, campaign maps to the caller's library, and the caller
-- must manage everything the copy touches.
create function public.check_map_copy(source_maps uuid[], target_campaign uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if coalesce(cardinality(source_maps), 0) not between 1 and 50 then
    raise exception 'Pick between 1 and 50 maps.';
  end if;

  if target_campaign is not null
     and not public.has_campaign_permission(target_campaign, 'manage_world') then
    raise exception 'You are not allowed to add to this world.';
  end if;

  if (
    select count(*) from public.world_entries e
    where e.id = any (source_maps)
      and e.kind = 'map'
      and public.can_manage_entry(e.id)
      and (e.owner_id is not null) = (target_campaign is not null)
  ) <> cardinality(source_maps) then
    raise exception 'You are not allowed to copy these maps.';
  end if;

  if (select count(*) from public.map_copy_closure(source_maps, target_campaign)) > 500 then
    raise exception 'These maps link too many entries to copy at once.';
  end if;

  if exists (
    select 1 from public.map_copy_closure(source_maps, target_campaign) c
    where not public.can_manage_entry(c.source_id)
  ) then
    raise exception 'You are not allowed to copy the linked entries.';
  end if;
end;
$$;

-- What the dialog shows, and what the app needs to copy the files first.
-- pin_count is the number of pins on a map (0 for anything else).
create function public.plan_map_copy(source_maps uuid[], target_campaign uuid default null)
returns table (
  source_id uuid,
  name text,
  kind public.world_entry_kind,
  is_root boolean,
  existing_id uuid,
  image_path text,
  pin_count integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.check_map_copy(source_maps, target_campaign);

  return query
  select
    c.source_id,
    e.name,
    e.kind,
    c.is_root,
    c.existing_id,
    (
      select f.value ->> 'path'
      from public.world_entry_fields f
      where f.entry_id = c.source_id and f.key = 'image' and f.type = 'image'
    ),
    (select count(*)::integer from public.world_map_markers m where m.map_id = c.source_id)
  from public.map_copy_closure(source_maps, target_campaign) c
  join public.world_entries e on e.id = c.source_id
  order by c.is_root desc, e.kind, e.name;
end;
$$;

-- ---------------------------------------------------------------------------
-- Copying
-- ---------------------------------------------------------------------------

-- The copy of one entry (fields, and the scene of a map; never pins), as
-- copy_world_entry made it, now shared with the copy of many. The caller has
-- already checked who may copy what. Internal only.
create function public.copy_entry_rows(
  source_entry uuid,
  new_entry_id uuid,
  target_campaign uuid,
  new_image_path text
)
returns void
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
begin
  select * into source from public.world_entries where id = source_entry;

  target_folder := case when target_campaign is null then auth.uid()::text else target_campaign::text end;

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

  insert into public.world_map_scenes
    (map_id, scene, scene_version, updated_at, updated_by, rendered_at)
  select
    new_entry_id, s.scene, s.scene_version, clock_timestamp(), auth.uid(),
    case when s.rendered_at is not null then clock_timestamp() end
  from public.world_map_scenes s
  where s.map_id = source_entry;
end;
$$;

-- One entry, as before; a map comes without its pins.
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
  elsif target_campaign is not null then
    raise exception 'Save campaign entries to your library first.';
  end if;

  perform public.copy_entry_rows(source_entry, new_entry_id, target_campaign, new_image_path);

  select * into created from public.world_entries where id = new_entry_id;
  return created;
end;
$$;

-- Maps with their pins, the entries the pins link and those entries' own pins,
-- all or nothing. new_ids maps each source id that is not already in the target
-- to the id of its copy, and image_paths maps the ones with a file to the path
-- the app copied it to. Both are checked against the plan as it is now, so a
-- change made since the app planned refuses the copy. Returns what was copied.
create function public.copy_maps_with_pins(
  source_maps uuid[],
  target_campaign uuid,
  new_ids jsonb,
  image_paths jsonb default '{}'
)
returns table (copied_source uuid, copied_new uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  closure jsonb;
  item record;
  expected text[];
  given text[];
begin
  perform public.check_map_copy(source_maps, target_campaign);

  -- Taken once, before anything is copied. Asked again afterwards, the new
  -- copies would be found as "already here" and the walk would stop at the
  -- first linked map, dropping the pins on it. Everything below reads this.
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'source_id', x.source_id, 'is_root', x.is_root, 'existing_id', x.existing_id
    )),
    '[]'::jsonb
  )
  into closure
  from public.map_copy_closure(source_maps, target_campaign) x;

  select array_agg(k.source_id::text order by k.source_id::text) into expected
  from jsonb_to_recordset(closure) as k (source_id uuid, is_root boolean, existing_id uuid)
  where k.existing_id is null;

  select array_agg(n order by n) into given from jsonb_object_keys(new_ids) n;

  if expected is distinct from given then
    raise exception 'These maps changed while they were being copied. Try again.';
  end if;

  -- Linked entries first, so each map ends up above what it links.
  for item in
    select k.source_id
    from jsonb_to_recordset(closure) as k (source_id uuid, is_root boolean, existing_id uuid)
    where k.existing_id is null
    order by k.is_root, k.source_id
  loop
    perform public.copy_entry_rows(
      item.source_id,
      (new_ids ->> item.source_id::text)::uuid,
      target_campaign,
      image_paths ->> item.source_id::text
    );
  end loop;

  -- Pins of the copied maps, pointing at the copy of what they linked, or at
  -- the copy that was already there.
  insert into public.world_map_markers (map_id, entry_id, x, y, created_by)
  select
    (new_ids ->> m.map_id::text)::uuid,
    coalesce((new_ids ->> m.entry_id::text)::uuid, k.existing_id),
    m.x,
    m.y,
    auth.uid()
  from public.world_map_markers m
  join jsonb_to_recordset(closure) as k (source_id uuid, is_root boolean, existing_id uuid)
    on k.source_id = m.entry_id
  where new_ids ? m.map_id::text;

  return query
  select e.key::uuid, e.value::uuid from jsonb_each_text(new_ids) e;
end;
$$;

revoke execute on function
  public.existing_copy_in(uuid, uuid),
  public.map_copy_closure(uuid[], uuid),
  public.check_map_copy(uuid[], uuid),
  public.copy_entry_rows(uuid, uuid, uuid, text)
from public, anon, authenticated;

revoke execute on function
  public.plan_map_copy(uuid[], uuid),
  public.copy_maps_with_pins(uuid[], uuid, jsonb, jsonb)
from public, anon;

grant execute on function
  public.plan_map_copy(uuid[], uuid),
  public.copy_maps_with_pins(uuid[], uuid, jsonb, jsonb)
to authenticated;
