-- The editable scene behind a map made in the map builder.
--
-- A built map still has an ordinary image (the "image" field of the entry,
-- uploaded to the world-maps bucket like any other), so the viewer, markers and
-- nested maps do not know the difference. The scene is only what the builder
-- needs to reopen it. A map is "built" when it has a row here.
--
-- Only people who can manage the world read scenes; players only ever need the
-- rendered image. Writes go through the functions below, like the other world
-- tables.
--
-- The scene is a JSON document with a numeric "version", the format version, so
-- later changes to the format can be upgraded by the builder. Its geometry is
-- in canvas pixels.

create table public.world_map_scenes (
  map_id uuid primary key references public.world_entries (id) on delete cascade,
  scene jsonb not null,
  scene_version integer not null,
  -- Compared on every save, so two tabs cannot overwrite each other.
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid references auth.users (id) on delete set null,
  -- When the image players see was last rendered from this scene.
  rendered_at timestamptz
);

alter table public.world_map_scenes enable row level security;

create policy "World managers read map scenes"
  on public.world_map_scenes for select
  using (
    exists (
      select 1
      from public.world_entries entry
      where entry.id = map_id
        and public.has_campaign_permission(entry.campaign_id, 'manage_world')
    )
  );

-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------

-- Creates a scene (expected_updated_at null) or replaces it. A replace is
-- refused unless expected_updated_at is the updated_at the caller loaded, so a
-- change made elsewhere in between is never lost. Returns the new updated_at.
-- mark_rendered records that the map image was just rendered from this scene.
create function public.save_map_scene(
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
  map_campaign uuid;
  map_kind public.world_entry_kind;
  current_updated timestamptz;
  saved timestamptz := clock_timestamp();
begin
  select campaign_id, kind into map_campaign, map_kind
  from public.world_entries where id = target_map;

  if map_campaign is null
     or not public.has_campaign_permission(map_campaign, 'manage_world') then
    raise exception 'You are not allowed to change this map.';
  end if;

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

-- For when an image is uploaded over a built map: the scene no longer matches
-- what players see, so it goes.
create function public.discard_map_scene(target_map uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  map_campaign uuid;
begin
  select campaign_id into map_campaign
  from public.world_entries where id = target_map;

  if map_campaign is null
     or not public.has_campaign_permission(map_campaign, 'manage_world') then
    raise exception 'You are not allowed to change this map.';
  end if;

  delete from public.world_map_scenes where map_id = target_map;
end;
$$;

revoke execute on function
  public.save_map_scene(uuid, jsonb, timestamptz, boolean),
  public.discard_map_scene(uuid)
from public, anon;

grant execute on function
  public.save_map_scene(uuid, jsonb, timestamptz, boolean),
  public.discard_map_scene(uuid)
to authenticated;
