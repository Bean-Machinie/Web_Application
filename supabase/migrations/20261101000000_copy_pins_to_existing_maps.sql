-- Two things for copies.
--
-- 1. A copied entry gets a pin on each map of the target that is a copy of a map
--    the entry is pinned on at the source. Only pins are added, and only to maps
--    that were already there; no text of an entry that already exists is touched.
--
-- 2. The plan says, for each entry that was picked, whether the target already has
--    a copy of it, so the app can ask before making another.

-- The plan, as before, with copy_here on the picked entries: the copy the target
-- already has of them, or null.
create or replace function public.plan_entry_copy(source_entries uuid[], target_campaign uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  snap jsonb := public.entry_copy_snapshot(source_entries, target_campaign);
begin
  return jsonb_build_object(
    'nodes', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'source_id', n.source_id,
            'name', e.name,
            'kind', e.kind,
            'is_root', n.is_root,
            'existing_id', n.existing_id,
            'copy_here', case
              when n.is_root then public.existing_copy_in(n.source_id, target_campaign)
            end,
            'image_path', (
              select f.value ->> 'path'
              from public.world_entry_fields f
              where f.entry_id = n.source_id and f.key = 'image' and f.type = 'image'
            )
          )
          order by n.is_root desc, e.kind, e.name
        )
        from jsonb_to_recordset(snap -> 'nodes') as n (source_id uuid, is_root boolean, existing_id uuid)
        join public.world_entries e on e.id = n.source_id
      ),
      '[]'::jsonb
    ),
    'edges', snap -> 'edges'
  );
end;
$$;

-- Entries with the entries they link, all or nothing, as before; and now each
-- entry copied also gets its pins on maps that are already in the target. Those
-- are found before anything is copied, from the maps the target had to begin
-- with, so a map copied here is never mistaken for one that was already there.
create or replace function public.copy_entries_with_links(
  source_entries uuid[],
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
  snap jsonb;
  id_map jsonb;
  incoming jsonb;
  item record;
  expected text[];
  given text[];
begin
  -- Taken once, before anything is copied. Asked again afterwards, the new
  -- copies would be found as "already here" and the walk would stop short.
  snap := public.entry_copy_snapshot(source_entries, target_campaign);

  with recursive reach (id) as (
    select unnest(source_entries)
    union
    select e.target_id
    from reach r
    join jsonb_to_recordset(snap -> 'edges') as e (source_id uuid, target_id uuid, link_type text)
      on e.source_id = r.id
    join jsonb_to_recordset(snap -> 'nodes') as n (source_id uuid, is_root boolean, existing_id uuid)
      on n.source_id = e.target_id
    where n.is_root or n.existing_id is not null or new_ids ? e.target_id::text
  )
  select array_agg(r.id::text order by r.id::text) into expected
  from reach r
  join jsonb_to_recordset(snap -> 'nodes') as n (source_id uuid, is_root boolean, existing_id uuid)
    on n.source_id = r.id
  where n.existing_id is null;

  select array_agg(k order by k) into given from jsonb_object_keys(new_ids) k;

  if expected is distinct from given then
    raise exception 'The linked entries changed, or the selection does not match them. Try again.';
  end if;

  id_map := new_ids || coalesce(
    (
      select jsonb_object_agg(n.source_id::text, to_jsonb(n.existing_id::text))
      from jsonb_to_recordset(snap -> 'nodes') as n (source_id uuid, is_root boolean, existing_id uuid)
      where n.existing_id is not null
    ),
    '{}'::jsonb
  );

  -- Pins on maps that the target already has: every pin at the source on an
  -- entry being copied, from a map that is not itself being copied and has a
  -- copy in the target.
  select coalesce(jsonb_agg(jsonb_build_object(
    'map_id', x.map_copy, 'entry_id', x.entry_source, 'x', x.x, 'y', x.y
  )), '[]'::jsonb)
  into incoming
  from (
    select
      public.existing_copy_in(m.map_id, target_campaign) as map_copy,
      m.entry_id as entry_source,
      m.x,
      m.y
    from public.world_map_markers m
    where new_ids ? m.entry_id::text
      and not (new_ids ? m.map_id::text)
  ) x
  where x.map_copy is not null;

  -- Linked entries first, so each selected entry ends up above what it links.
  for item in
    select n.source_id
    from jsonb_to_recordset(snap -> 'nodes') as n (source_id uuid, is_root boolean, existing_id uuid)
    where new_ids ? n.source_id::text
    order by n.is_root, n.source_id
  loop
    begin
      perform public.copy_entry_rows(
        item.source_id,
        (new_ids ->> item.source_id::text)::uuid,
        target_campaign,
        image_paths ->> item.source_id::text
      );
    exception when others then
      raise exception '%: %',
        (select e.name from public.world_entries e where e.id = item.source_id),
        sqlerrm;
    end;
  end loop;

  -- Pins of the copied entries, to the copy of what they linked or the copy
  -- that was already there; a pin to anything else is dropped.
  insert into public.world_map_markers (map_id, entry_id, x, y, created_by)
  select
    (new_ids ->> m.map_id::text)::uuid,
    (id_map ->> m.entry_id::text)::uuid,
    m.x,
    m.y,
    auth.uid()
  from public.world_map_markers m
  where new_ids ? m.map_id::text
    and id_map ? m.entry_id::text;

  -- And the new pins on the maps that were already there.
  insert into public.world_map_markers (map_id, entry_id, x, y, created_by)
  select i.map_id, (new_ids ->> i.entry_id::text)::uuid, i.x, i.y, auth.uid()
  from jsonb_to_recordset(incoming) as i (map_id uuid, entry_id uuid, x real, y real);

  update public.world_entries
  set updated_at = now()
  where id in (
    select i.map_id
    from jsonb_to_recordset(incoming) as i (map_id uuid, entry_id uuid, x real, y real)
  );

  perform public.remap_copied_mentions(
    array(select e.value::uuid from jsonb_each_text(new_ids) e),
    id_map
  );

  return query
  select e.key::uuid, e.value::uuid from jsonb_each_text(new_ids) e;
end;
$$;
