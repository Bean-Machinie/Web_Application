-- Markers on a map: each one pins a world entry at a spot on the map image.
--
-- Positions are percentages of the image (x from the left, y from the top),
-- so they stay put at any zoom or screen size.
--
-- A marker has no visibility of its own. A person can read it only when they
-- can read both the map and the linked entry, which are the rules of the
-- "Read world entries" policy: GMs see everything, players only see revealed
-- entries. Revealing the linked entry therefore reveals its marker, and a
-- hidden marker is never sent to a player.
--
-- A marker may link to any entry, including another map, so a marker can open
-- a nested map later without a change here. Writes only happen through the
-- functions below, like the other world tables.

create table public.world_map_markers (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.world_entries (id) on delete cascade,
  entry_id uuid not null references public.world_entries (id) on delete cascade,
  x real not null check (x between 0 and 100),
  y real not null check (y between 0 and 100),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (map_id <> entry_id)
);

create index world_map_markers_map_idx on public.world_map_markers (map_id);
create index world_map_markers_entry_idx on public.world_map_markers (entry_id);

alter table public.world_map_markers enable row level security;

-- Each exists() runs the entry's own read policy as the caller.
create policy "Read world map markers"
  on public.world_map_markers for select
  using (
    exists (select 1 from public.world_entries where id = map_id)
    and exists (select 1 from public.world_entries where id = entry_id)
  );

-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------

create function public.add_map_marker(
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
  map_campaign uuid;
  map_kind public.world_entry_kind;
  linked_campaign uuid;
  created public.world_map_markers;
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

  if target_map = linked_entry then
    raise exception 'A map cannot be pinned to itself.';
  end if;

  select campaign_id into linked_campaign
  from public.world_entries where id = linked_entry;

  if linked_campaign is distinct from map_campaign then
    raise exception 'That entry does not belong to this campaign.';
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

create function public.move_map_marker(target_marker uuid, pos_x real, pos_y real)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  on_map uuid;
  map_campaign uuid;
begin
  select m.map_id, e.campaign_id into on_map, map_campaign
  from public.world_map_markers m
  join public.world_entries e on e.id = m.map_id
  where m.id = target_marker;

  if on_map is null
     or not public.has_campaign_permission(map_campaign, 'manage_world') then
    raise exception 'You are not allowed to change this map.';
  end if;

  if pos_x not between 0 and 100 or pos_y not between 0 and 100 then
    raise exception 'That spot is outside the map.';
  end if;

  update public.world_map_markers set x = pos_x, y = pos_y where id = target_marker;
  update public.world_entries set updated_at = now() where id = on_map;
end;
$$;

create function public.remove_map_marker(target_marker uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  on_map uuid;
  map_campaign uuid;
begin
  select m.map_id, e.campaign_id into on_map, map_campaign
  from public.world_map_markers m
  join public.world_entries e on e.id = m.map_id
  where m.id = target_marker;

  if on_map is null
     or not public.has_campaign_permission(map_campaign, 'manage_world') then
    raise exception 'You are not allowed to change this map.';
  end if;

  delete from public.world_map_markers where id = target_marker;
  update public.world_entries set updated_at = now() where id = on_map;
end;
$$;

revoke execute on function
  public.add_map_marker(uuid, uuid, real, real),
  public.move_map_marker(uuid, real, real),
  public.remove_map_marker(uuid)
from public, anon;

grant execute on function
  public.add_map_marker(uuid, uuid, real, real),
  public.move_map_marker(uuid, real, real),
  public.remove_map_marker(uuid)
to authenticated;
