-- Mentions: entries linking to each other from rich text fields. The document
-- is the source of truth; this table is derived from it by a trigger.
--
-- A mention in a document is {"type":"mention","attrs":{"id":"<entry id>","label":"<name>"}}.
-- The label is the name as it was when the mention was made and is never
-- updated, so renaming a hidden entry cannot leak its new name into public text.

create table public.world_entry_mentions (
  source_entry_id uuid not null,
  field_key text not null,
  target_entry_id uuid not null references public.world_entries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (source_entry_id, field_key, target_entry_id),
  foreign key (source_entry_id, field_key)
    references public.world_entry_fields (entry_id, key) on delete cascade
);

create index world_entry_mentions_target_idx on public.world_entry_mentions (target_entry_id);

alter table public.world_entry_mentions enable row level security;

-- Each exists() runs the other table's own read policy as the caller. A player
-- can read a field only when it is not private and its entry is revealed to
-- them, and an entry only when it is revealed, so a row is theirs only when
-- both ends are. A manager reads every row of their world.
create policy "Read world entry mentions"
  on public.world_entry_mentions for select
  using (
    exists (
      select 1 from public.world_entry_fields f
      where f.entry_id = source_entry_id and f.key = field_key
    )
    and exists (select 1 from public.world_entries t where t.id = target_entry_id)
  );

-- ---------------------------------------------------------------------------
-- Rewriting a document's mentions
-- ---------------------------------------------------------------------------

-- keep maps an old entry id to the id a mention should now point at. A mention
-- whose id is not in keep becomes plain text (its label), so a link is never
-- left pointing at something it should not. Pure, so anyone may call it.
create function public.rewrite_mentions(doc jsonb, keep jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
begin
  if jsonb_typeof(doc) = 'array' then
    return coalesce(
      (
        select jsonb_agg(public.rewrite_mentions(t.e, keep) order by t.n)
        from jsonb_array_elements(doc) with ordinality as t (e, n)
      ),
      '[]'::jsonb
    );
  end if;

  if jsonb_typeof(doc) <> 'object' then
    return doc;
  end if;

  if doc ->> 'type' = 'mention' then
    if keep ? (doc #>> '{attrs,id}') then
      return jsonb_set(doc, '{attrs,id}', keep -> (doc #>> '{attrs,id}'));
    end if;

    -- An empty text node is not valid in the editor.
    return jsonb_build_object(
      'type', 'text',
      'text', coalesce(nullif(trim(doc #>> '{attrs,label}'), ''), 'someone')
    );
  end if;

  if doc ? 'content' then
    return jsonb_set(doc, '{content}', public.rewrite_mentions(doc -> 'content', keep));
  end if;

  return doc;
end;
$$;

-- ---------------------------------------------------------------------------
-- Keeping the table in step with the documents
-- ---------------------------------------------------------------------------

-- Whatever writes a field, its mentions follow: the save function, copies and
-- starter entries alike. Only a mention of another entry in the same home
-- counts; anything else stays in the document but is not a link.
create function public.sync_entry_mentions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.world_entry_mentions
  where source_entry_id = new.entry_id and field_key = new.key;

  if new.type = 'rich_text' then
    insert into public.world_entry_mentions (source_entry_id, field_key, target_entry_id)
    select distinct new.entry_id, new.key, t.id
    from jsonb_path_query(new.value, 'lax $.** ? (@.type == "mention").attrs.id') as m (v)
    join public.world_entries t
      on t.id = case
        when m.v #>> '{}' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then (m.v #>> '{}')::uuid
      end
    join public.world_entries s on s.id = new.entry_id
    where t.id <> s.id
      and t.campaign_id is not distinct from s.campaign_id
      and t.owner_id is not distinct from s.owner_id;
  end if;

  return null;
end;
$$;

create trigger world_entry_fields_sync_mentions
  after insert or update of value, type on public.world_entry_fields
  for each row execute function public.sync_entry_mentions();

-- When an entry is deleted, the mentions of it in other documents become plain
-- text; their other mentions stay. Several entries deleted in one statement, or
-- a whole campaign, each run this for their own row: a document already
-- rewritten or already gone is simply not found or not changed again.
create function public.unlink_mentions_of_deleted_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.world_entry_fields f
  set value = public.rewrite_mentions(
        f.value,
        (
          select coalesce(jsonb_object_agg(x.id, to_jsonb(x.id)), '{}'::jsonb)
          from (
            select distinct v #>> '{}' as id
            from jsonb_path_query(f.value, 'lax $.** ? (@.type == "mention").attrs.id') as v
          ) x
          where x.id is not null and x.id <> old.id::text
        )
      ),
      updated_at = now()
  from public.world_entry_mentions m
  where m.target_entry_id = old.id
    and f.entry_id = m.source_entry_id
    and f.key = m.field_key
    and f.entry_id <> old.id;

  return old;
end;
$$;

create trigger world_entries_unlink_mentions
  before delete on public.world_entries
  for each row execute function public.unlink_mentions_of_deleted_entry();

-- ---------------------------------------------------------------------------
-- Reading: a player gets a mention as a link only to an entry revealed to them
-- ---------------------------------------------------------------------------

create or replace function public.get_world_entry_fields(target_entry uuid)
returns table (
  key text,
  type public.world_field_type,
  value jsonb,
  private boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  owning uuid;
  is_revealed boolean;
  manager boolean;
begin
  select e.campaign_id, e.revealed into owning, is_revealed
  from public.world_entries e
  where e.id = target_entry;

  if not found then
    return;
  end if;

  manager := public.can_manage_entry(target_entry);
  if not manager
     and not (
       owning is not null and is_revealed and public.is_campaign_member(owning)
     ) then
    return;
  end if;

  return query
  select
    f.key,
    f.type,
    case
      when f.private and not manager then null::jsonb
      when not manager and f.type = 'rich_text' then public.rewrite_mentions(
        f.value,
        (
          select coalesce(jsonb_object_agg(t.id::text, to_jsonb(t.id::text)), '{}'::jsonb)
          from public.world_entry_mentions mm
          join public.world_entries t on t.id = mm.target_entry_id
          where mm.source_entry_id = f.entry_id
            and mm.field_key = f.key
            and t.revealed
            and t.campaign_id = owning
        )
      )
      else f.value
    end,
    f.private
  from public.world_entry_fields f
  where f.entry_id = target_entry
    and (
      manager
      or not f.private
      or not (f.value = 'null'::jsonb or f.value = '""'::jsonb)
    );
end;
$$;

-- The text a search looks through, in place of reading the table: mentions are
-- flattened to their labels, so no entry id leaves the database for this. It
-- runs as the caller, so the read policies decide which fields and entries
-- there are, private ones included. Target null is the caller's library.
create function public.get_world_search_text(target_campaign uuid default null)
returns table (entry_id uuid, key text, value jsonb)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    f.entry_id,
    f.key,
    case
      when f.type = 'rich_text' then public.rewrite_mentions(f.value, '{}'::jsonb)
      else f.value
    end
  from public.world_entry_fields f
  join public.world_entries e on e.id = f.entry_id
  where f.type in ('rich_text', 'short_text', 'select')
    and case
      when target_campaign is null then e.owner_id = auth.uid()
      else e.campaign_id = target_campaign
    end;
$$;

-- ---------------------------------------------------------------------------
-- Copying: mentions follow the same rule as pins
-- ---------------------------------------------------------------------------

-- Once the copies exist, their mentions are pointed at the target: at the copy
-- made in this same operation (new_ids), or at the copy the target already had
-- of the mentioned entry; with neither, the mention becomes plain text. A
-- mention never brings an entry along on its own.
--
-- A mentioned entry that is in new_ids has no earlier copy, and one that is
-- not has no copy made here, so asking existing_copy_in after the copies were
-- made cannot find the wrong one.
create function public.remap_copied_mentions(
  copied_ids uuid[],
  new_ids jsonb,
  target_campaign uuid
)
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
        jsonb_object_agg(x.src, to_jsonb(x.dest::text)) filter (where x.dest is not null),
        '{}'::jsonb
      )
      from (
        select
          ids.src,
          coalesce(
            (new_ids ->> ids.src)::uuid,
            case
              when ids.src ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                then public.existing_copy_in(ids.src::uuid, target_campaign)
            end
          ) as dest
        from (
          select distinct m.v #>> '{}' as src
          from jsonb_path_query(f.value, 'lax $.** ? (@.type == "mention").attrs.id') as m (v)
        ) ids
        where ids.src is not null
      ) x
    )
  )
  where f.entry_id = any (copied_ids)
    and f.type = 'rich_text'
    and jsonb_path_exists(f.value, 'lax $.** ? (@.type == "mention")');
end;
$$;

-- Only the pure rewrite is open to callers (the search function runs as them).
revoke execute on function public.rewrite_mentions(jsonb, jsonb) from public, anon;
grant execute on function public.rewrite_mentions(jsonb, jsonb) to authenticated;

revoke execute on function
  public.sync_entry_mentions(),
  public.unlink_mentions_of_deleted_entry(),
  public.remap_copied_mentions(uuid[], jsonb, uuid)
from public, anon, authenticated;

revoke execute on function public.get_world_search_text(uuid) from public, anon;
grant execute on function public.get_world_search_text(uuid) to authenticated;

-- One entry, as before, with its mentions remapped.
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

  perform public.remap_copied_mentions(
    array[new_entry_id],
    jsonb_build_object(source_entry::text, new_entry_id::text),
    target_campaign
  );

  select * into created from public.world_entries where id = new_entry_id;
  return created;
end;
$$;

-- Maps with pins, as before, with the mentions of everything copied remapped.
create or replace function public.copy_maps_with_pins(
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

  perform public.remap_copied_mentions(
    array(select e.value::uuid from jsonb_each_text(new_ids) e),
    new_ids,
    target_campaign
  );

  return query
  select e.key::uuid, e.value::uuid from jsonb_each_text(new_ids) e;
end;
$$;

-- ---------------------------------------------------------------------------
-- One place to read every link between entries
-- ---------------------------------------------------------------------------

-- Pins and mentions as edges, for a connections panel or a graph.
-- security_invoker makes each table's own read policy apply to whoever asks, so
-- the edges someone gets are the ones they may see. Nothing writes to it; pins
-- and mentions are written where they always were.
create view public.world_entry_links
with (security_invoker = true)
as
select
  'pin'::text as link_type,
  m.map_id as source_id,
  m.entry_id as target_id,
  null::text as field_key,
  m.id as marker_id,
  m.x,
  m.y
from public.world_map_markers m
union all
select
  'mention'::text,
  s.source_entry_id,
  s.target_entry_id,
  s.field_key,
  null::uuid,
  null::real,
  null::real
from public.world_entry_mentions s;

grant select on public.world_entry_links to authenticated;
