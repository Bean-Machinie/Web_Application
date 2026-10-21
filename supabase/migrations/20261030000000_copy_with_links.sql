-- One copy of entries with their links. The closure walks every link between
-- entries (pins and mentions, through world_entry_links), so a link type added
-- to that view comes along with no change here.
--
-- A link survives a copy only if both its ends exist in the target: a pin to an
-- entry that was not copied is dropped, and a mention of it becomes plain text.
-- An entry that already has a copy in the target counts as "already here", and
-- links to it point at that copy.

drop function public.copy_maps_with_pins(uuid[], uuid, jsonb, jsonb);
drop function public.plan_map_copy(uuid[], uuid);
drop function public.check_map_copy(uuid[], uuid);
drop function public.map_copy_closure(uuid[], uuid);
drop function public.remap_copied_mentions(uuid[], jsonb, uuid);

-- Everything a copy of these entries reaches: the entries, what they link, and
-- what that links, recursively. An entry that has a copy in the target is
-- listed but not followed. The union drops repeats, which also ends a cycle.
-- The answer depends on what is in the target, so only entry_copy_snapshot
-- calls this, once, before anything is copied.
create function public.entry_copy_closure(source_entries uuid[], target_campaign uuid)
returns table (source_id uuid, is_root boolean, existing_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
  with recursive reach (id) as (
    select unnest(source_entries)
    union
    select l.target_id
    from reach r
    join public.world_entry_links l on l.source_id = r.id
    where l.target_id <> r.id
      and (
        r.id = any (source_entries)
        or public.existing_copy_in(r.id, target_campaign) is null
      )
  )
  select
    r.id,
    r.id = any (source_entries),
    case when r.id = any (source_entries)
      then null
      else public.existing_copy_in(r.id, target_campaign)
    end
  from reach r;
end;
$$;

-- Every rule a copy must meet, and the closure with the links among it, taken
-- once. Library entries go to a campaign the caller manages, campaign entries
-- to the caller's library, and the caller must manage everything touched.
-- Returns {"nodes": [{source_id, is_root, existing_id}],
--          "edges": [{source_id, target_id, link_type}]}; an edge is listed
-- only from an entry that would be copied, to anything in the closure.
create function public.entry_copy_snapshot(source_entries uuid[], target_campaign uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  nodes jsonb;
  edges jsonb;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if coalesce(cardinality(source_entries), 0) not between 1 and 200 then
    raise exception 'Pick between 1 and 200 entries.';
  end if;

  if target_campaign is not null
     and not public.has_campaign_permission(target_campaign, 'manage_world') then
    raise exception 'You are not allowed to add to this world.';
  end if;

  if (
    select count(*) from public.world_entries e
    where e.id = any (source_entries)
      and public.can_manage_entry(e.id)
      and (e.owner_id is not null) = (target_campaign is not null)
  ) <> cardinality(source_entries) then
    raise exception 'You are not allowed to copy these entries.';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object(
      'source_id', c.source_id, 'is_root', c.is_root, 'existing_id', c.existing_id
    )),
    '[]'::jsonb
  )
  into nodes
  from public.entry_copy_closure(source_entries, target_campaign) c;

  if jsonb_array_length(nodes) > 500 then
    raise exception 'These entries link too many others to copy at once.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(nodes) as n (source_id uuid, is_root boolean, existing_id uuid)
    where not public.can_manage_entry(n.source_id)
  ) then
    raise exception 'You are not allowed to copy the linked entries.';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object(
      'source_id', l.source_id, 'target_id', l.target_id, 'link_type', l.link_type
    )),
    '[]'::jsonb
  )
  into edges
  from (
    select distinct l0.source_id, l0.target_id, l0.link_type
    from public.world_entry_links l0
    where l0.source_id <> l0.target_id
      and l0.source_id in (
        select n.source_id
        from jsonb_to_recordset(nodes) as n (source_id uuid, is_root boolean, existing_id uuid)
        where n.is_root or n.existing_id is null
      )
      and l0.target_id in (
        select n.source_id
        from jsonb_to_recordset(nodes) as n (source_id uuid, is_root boolean, existing_id uuid)
      )
  ) l;

  return jsonb_build_object('nodes', nodes, 'edges', edges);
end;
$$;

-- What the dialog shows: the entries, with names and image files for the copy
-- to prepare, and the links among them to say why each comes along.
create function public.plan_entry_copy(source_entries uuid[], target_campaign uuid default null)
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

-- Points the mentions of copied entries at the target. id_map maps an entry to
-- the entry a mention of it becomes: its copy made in this operation, or the
-- copy the target already had. A mention of anything else becomes plain text.
-- It reads the map it is given, never the database, so the copies just made
-- cannot change the answer.
create function public.remap_copied_mentions(copied_ids uuid[], id_map jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.world_entry_fields f
  set value = public.rewrite_mentions(
    f.value,
    (
      select coalesce(
        jsonb_object_agg(x.src, id_map -> x.src) filter (where id_map ? x.src),
        '{}'::jsonb
      )
      from (
        select distinct m.v #>> '{}' as src
        from jsonb_path_query(f.value, 'lax $.** ? (@.type == "mention").attrs.id') as m (v)
      ) x
      where x.src is not null
    )
  )
  where f.entry_id = any (copied_ids)
    and f.type = 'rich_text'
    and jsonb_path_exists(f.value, 'lax $.** ? (@.type == "mention")');
end;
$$;

-- One entry on its own, as before: its mentions go to the copies the target
-- already has, or become plain text, and it carries no pins.
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
  id_map jsonb;
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

  -- Taken before the copy exists, so it cannot find itself.
  id_map := jsonb_build_object(source_entry::text, new_entry_id::text)
    || coalesce(
      (
        select jsonb_object_agg(t.target_entry_id::text, to_jsonb(t.copy_id::text))
        from (
          select distinct
            m.target_entry_id,
            public.existing_copy_in(m.target_entry_id, target_campaign) as copy_id
          from public.world_entry_mentions m
          where m.source_entry_id = source_entry
        ) t
        where t.copy_id is not null
      ),
      '{}'::jsonb
    );

  perform public.copy_entry_rows(source_entry, new_entry_id, target_campaign, new_image_path);
  perform public.remap_copied_mentions(array[new_entry_id], id_map);

  select * into created from public.world_entries where id = new_entry_id;
  return created;
end;
$$;

-- Entries with the entries they link, all or nothing. new_ids maps the selected
-- entries, and each linked entry that was kept, to the id of its copy;
-- image_paths maps the ones with a file to the path the app copied it to.
--
-- The selection is checked against the snapshot taken here: new_ids must name
-- exactly what is reached from the selected entries through entries in new_ids
-- or already in the target. An entry that is not linked, or is linked only
-- through one that was left out, makes the copy refuse; an entry left out is
-- always fine. A copy that fails says which entry it failed on.
create function public.copy_entries_with_links(
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

  perform public.remap_copied_mentions(
    array(select e.value::uuid from jsonb_each_text(new_ids) e),
    id_map
  );

  return query
  select e.key::uuid, e.value::uuid from jsonb_each_text(new_ids) e;
end;
$$;

revoke execute on function
  public.entry_copy_closure(uuid[], uuid),
  public.entry_copy_snapshot(uuid[], uuid),
  public.remap_copied_mentions(uuid[], jsonb)
from public, anon, authenticated;

revoke execute on function
  public.plan_entry_copy(uuid[], uuid),
  public.copy_entries_with_links(uuid[], uuid, jsonb, jsonb)
from public, anon;

grant execute on function
  public.plan_entry_copy(uuid[], uuid),
  public.copy_entries_with_links(uuid[], uuid, jsonb, jsonb)
to authenticated;
