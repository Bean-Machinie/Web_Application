-- Dormant mentions. A mention whose entry is not in the document's home stays in
-- the text, shows as plain text, and is remembered here, so that when the entry or
-- a copy of it arrives in that home the mention connects again. A dormant mention
-- is a mention node whose id is not an entry of the home: the id of an entry that
-- was deleted, or of the entry it was copied from. Nothing is added to the node.

-- The old delete trigger rewrote the text of other entries to plain text when an
-- entry was deleted. It is dropped (20261031000000 does too, so this is a no-op
-- where that ran): with it in place it would run after the trigger below and undo
-- it, turning the mention into plain text and removing its dormant row.
drop trigger if exists world_entries_unlink_mentions on public.world_entries;
drop function if exists public.unlink_mentions_of_deleted_entry();

-- A copy's source stays on record after the source is deleted, so a copy still
-- leads back to it. Nothing reads the old link as "this entry exists".
alter table public.world_entries
  drop constraint if exists world_entries_source_entry_id_fkey;

-- An entry and the ones it descends from: the entry, what it was copied from, and
-- so on a few hops, kept even when the last of them is no longer there.
create function public.entry_lineage(start_entry uuid)
returns uuid[]
language sql
stable
security definer
set search_path = ''
as $$
  with recursive chain (id, source, depth) as (
    select e.id, e.source_entry_id, 0
    from public.world_entries e
    where e.id = start_entry
    union all
    select e.id, e.source_entry_id, c.depth + 1
    from chain c
    join public.world_entries e on e.id = c.source
    where c.depth < 4
  )
  select array(
    select distinct l.x
    from (
      select start_entry as x
      union select c.id from chain c
      union select c.source from chain c where c.source is not null
    ) l
  );
$$;

-- The mentions that are waiting. lineage is the origin's lineage as it was when the
-- mention went dormant, because once the origin is deleted its own row, and with it
-- its chain, is gone. Only functions use this table.
create table public.world_dormant_mentions (
  source_entry_id uuid not null,
  field_key text not null,
  origin_entry_id uuid not null,
  lineage uuid[] not null,
  primary key (source_entry_id, field_key, origin_entry_id),
  foreign key (source_entry_id, field_key)
    references public.world_entry_fields (entry_id, key) on delete cascade
);

create index world_dormant_mentions_lineage_idx
  on public.world_dormant_mentions using gin (lineage);

alter table public.world_dormant_mentions enable row level security;

-- ---------------------------------------------------------------------------
-- Rewriting: unmapped mentions can now be left as they are
-- ---------------------------------------------------------------------------

-- Same as before, with keep_unmapped: when true a mention whose id is not in keep
-- is left untouched (it is dormant), instead of becoming plain text. What is sent
-- to players and to search keeps the default, so they never receive one.
drop function public.rewrite_mentions(jsonb, jsonb);

create function public.rewrite_mentions(
  doc jsonb,
  keep jsonb,
  keep_unmapped boolean default false
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
begin
  if jsonb_typeof(doc) = 'array' then
    return coalesce(
      (
        select jsonb_agg(public.rewrite_mentions(t.e, keep, keep_unmapped) order by t.n)
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

    if keep_unmapped then
      return doc;
    end if;

    -- An empty text node is not valid in the editor.
    return jsonb_build_object(
      'type', 'text',
      'text', coalesce(nullif(trim(doc #>> '{attrs,label}'), ''), 'someone')
    );
  end if;

  if doc ? 'content' then
    return jsonb_set(doc, '{content}', public.rewrite_mentions(doc -> 'content', keep, keep_unmapped));
  end if;

  return doc;
end;
$$;

-- ---------------------------------------------------------------------------
-- Keeping the tables in step with the documents
-- ---------------------------------------------------------------------------

-- Every id a document mentions is either an entry of the same home (a mention) or
-- not (dormant). A dormant mention keeps the lineage it was first stored with.
create or replace function public.sync_entry_mentions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ids uuid[];
begin
  if new.type = 'rich_text' then
    select array_agg(distinct (m.v #>> '{}')::uuid) into ids
    from jsonb_path_query(new.value, 'lax $.** ? (@.type == "mention").attrs.id') as m (v)
    where m.v #>> '{}' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  end if;

  delete from public.world_entry_mentions
  where source_entry_id = new.entry_id and field_key = new.key;

  -- Dormant rows go when the mention is no longer in the text, or its entry is now
  -- here. The rest are kept as they are.
  delete from public.world_dormant_mentions d
  using public.world_entries s
  where d.source_entry_id = new.entry_id
    and d.field_key = new.key
    and s.id = new.entry_id
    and (
      ids is null
      or d.origin_entry_id <> all (ids)
      or exists (
        select 1 from public.world_entries t
        where t.id = d.origin_entry_id
          and t.campaign_id is not distinct from s.campaign_id
          and t.owner_id is not distinct from s.owner_id
      )
    );

  if ids is not null then
    insert into public.world_entry_mentions (source_entry_id, field_key, target_entry_id)
    select new.entry_id, new.key, t.id
    from unnest(ids) as u (id)
    join public.world_entries t on t.id = u.id
    join public.world_entries s on s.id = new.entry_id
    where t.id <> s.id
      and t.campaign_id is not distinct from s.campaign_id
      and t.owner_id is not distinct from s.owner_id;

    insert into public.world_dormant_mentions (source_entry_id, field_key, origin_entry_id, lineage)
    select new.entry_id, new.key, u.id, public.entry_lineage(u.id)
    from unnest(ids) as u (id)
    join public.world_entries s on s.id = new.entry_id
    where u.id <> new.entry_id
      and not exists (
        select 1 from public.world_entries t
        where t.id = u.id
          and t.campaign_id is not distinct from s.campaign_id
          and t.owner_id is not distinct from s.owner_id
      )
    on conflict do nothing;
  end if;

  return null;
end;
$$;

-- When an entry is deleted, the mentions of it become dormant, with its lineage
-- taken now, while its row is still there. This only inserts: it changes no other
-- row, so it cannot meet "tuple already modified" the way a rewrite of the
-- documents did when several entries were deleted together. The documents keep the
-- node with the id of the deleted entry.
create function public.remember_mentions_of_deleted_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.world_dormant_mentions (source_entry_id, field_key, origin_entry_id, lineage)
  select m.source_entry_id, m.field_key, old.id, public.entry_lineage(old.id)
  from public.world_entry_mentions m
  where m.target_entry_id = old.id and m.source_entry_id <> old.id
  on conflict do nothing;

  return old;
end;
$$;

create trigger world_entries_remember_mentions
  before delete on public.world_entries
  for each row execute function public.remember_mentions_of_deleted_entry();

-- ---------------------------------------------------------------------------
-- Copying
-- ---------------------------------------------------------------------------

-- When copies arrive, the dormant mentions of their home that they stand in for
-- connect to them: the copy's lineage and the stored lineage share an id. Only the
-- same home, and the first copy to arrive wins, because the mention then no
-- longer waits. Only the id inside the mention is changed, never the text.
create function public.reconnect_dormant_mentions(copied_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.world_entry_fields f
  set value = public.rewrite_mentions(f.value, r.copies, true)
  from (
    select p.source_entry_id, p.field_key,
           jsonb_object_agg(p.origin_entry_id::text, to_jsonb(p.copy_id::text)) as copies
    from (
      select distinct on (d.source_entry_id, d.field_key, d.origin_entry_id)
        d.source_entry_id, d.field_key, d.origin_entry_id, c.id as copy_id
      from public.world_dormant_mentions d
      join public.world_entries se on se.id = d.source_entry_id
      join public.world_entries c on c.id = any (copied_ids)
      where c.id <> d.source_entry_id
        and se.campaign_id is not distinct from c.campaign_id
        and se.owner_id is not distinct from c.owner_id
        and public.entry_lineage(c.id) && d.lineage
      order by d.source_entry_id, d.field_key, d.origin_entry_id, c.created_at, c.id
    ) p
    group by p.source_entry_id, p.field_key
  ) r
  where f.entry_id = r.source_entry_id and f.key = r.field_key and f.type = 'rich_text';
end;
$$;

-- Points the mentions of copied entries at the target: at the copy made in this
-- operation or the one the target already had. A mention of anything else is left
-- as it is and so goes dormant. Then dormant mentions waiting in the target for
-- these copies connect. The copy functions call this last, so it needs no change
-- in them.
create or replace function public.remap_copied_mentions(copied_ids uuid[], id_map jsonb)
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
    ),
    true
  )
  where f.entry_id = any (copied_ids)
    and f.type = 'rich_text'
    and jsonb_path_exists(f.value, 'lax $.** ? (@.type == "mention")');

  perform public.reconnect_dormant_mentions(copied_ids);
end;
$$;

-- Only the pure rewrite is open to callers (the search function runs as them).
revoke execute on function public.rewrite_mentions(jsonb, jsonb, boolean) from public, anon;
grant execute on function public.rewrite_mentions(jsonb, jsonb, boolean) to authenticated;

revoke execute on function
  public.entry_lineage(uuid),
  public.remember_mentions_of_deleted_entry(),
  public.reconnect_dormant_mentions(uuid[])
from public, anon, authenticated;
