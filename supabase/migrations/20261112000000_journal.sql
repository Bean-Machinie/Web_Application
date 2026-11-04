-- Journal: pages a GM writes for a campaign, nested like a tree, each one a
-- document of blocks (Tiptap JSON). A page is hidden from players until it is
-- revealed, and inside a revealed page the blocks meant for the GM never reach
-- a player: gmNote blocks, and any block whose attrs.visibility is 'gm'.
--
-- Like world entries: players get no select policy, reads go through functions
-- that decide what each person is sent, and writes only happen through the
-- security definer functions below. Who may write is has_campaign_permission
-- 'manage_world'.

create table public.journal_pages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  -- Deleting a page takes the pages inside it.
  parent_id uuid references public.journal_pages (id) on delete cascade,
  -- The order among the pages with the same parent. Only the order counts, so
  -- there may be gaps.
  position integer not null default 0,
  title text not null default '' check (char_length(title) <= 120),
  content jsonb not null default 'null'::jsonb check (pg_column_size(content) < 500000),
  revealed boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_pages_tree_idx
  on public.journal_pages (campaign_id, parent_id, position);

alter table public.journal_pages enable row level security;

-- Only people who manage the world read the table. Players are sent pages by
-- get_journal_tree and get_journal_page.
create policy "Managers read journal pages"
  on public.journal_pages for select
  using (public.has_campaign_permission(campaign_id, 'manage_world'));

-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------

-- The campaign of a page the caller may change; raises for anyone else. The
-- functions below look the page up first, so the permission is checked against
-- the campaign the page really belongs to.
create function public.require_journal_manager(page uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  owning uuid;
begin
  select campaign_id into owning from public.journal_pages where id = page;

  if owning is null
     or not public.has_campaign_permission(owning, 'manage_world') then
    raise exception 'You are not allowed to change this page.';
  end if;

  return owning;
end;
$$;

-- The new page goes last among its siblings.
create function public.create_journal_page(
  target_campaign uuid,
  parent uuid default null,
  page_title text default ''
)
returns public.journal_pages
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.journal_pages;
begin
  if not public.has_campaign_permission(target_campaign, 'manage_world') then
    raise exception 'You are not allowed to add to this journal.';
  end if;

  if parent is not null and not exists (
    select 1 from public.journal_pages p
    where p.id = parent and p.campaign_id = target_campaign
  ) then
    raise exception 'That page is not in this journal.';
  end if;

  if char_length(trim(page_title)) > 120 then
    raise exception 'The title is too long.';
  end if;

  insert into public.journal_pages (campaign_id, parent_id, position, title, created_by)
  values (
    target_campaign,
    parent,
    coalesce(
      (
        select max(p.position) + 1 from public.journal_pages p
        where p.campaign_id = target_campaign and p.parent_id is not distinct from parent
      ),
      0
    ),
    trim(page_title),
    auth.uid()
  )
  returning * into created;

  return created;
end;
$$;

create function public.set_journal_page_title(target_page uuid, new_title text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_journal_manager(target_page);

  if char_length(trim(new_title)) > 120 then
    raise exception 'The title is too long.';
  end if;

  update public.journal_pages
  set title = trim(new_title), updated_at = now()
  where id = target_page;
end;
$$;

create function public.set_journal_page_content(target_page uuid, new_content jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_journal_manager(target_page);

  update public.journal_pages
  set content = coalesce(new_content, 'null'::jsonb), updated_at = now()
  where id = target_page;
end;
$$;

-- Moves a page under a parent (null for the top) at a place among its new
-- siblings, 0 being first. Dropping a page in another place under the same
-- parent is the reordering. It does not stamp updated_at: moving a page is not
-- editing it.
create function public.move_journal_page(
  target_page uuid,
  new_parent uuid,
  new_position integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owning uuid;
  ordered uuid[];
  slot integer;
begin
  owning := public.require_journal_manager(target_page);

  if new_parent is not null then
    if not exists (
      select 1 from public.journal_pages p
      where p.id = new_parent and p.campaign_id = owning
    ) then
      raise exception 'That page is not in this journal.';
    end if;

    -- A page cannot go inside itself or inside one of its own pages.
    if new_parent = target_page or exists (
      with recursive below (id) as (
        select p.id from public.journal_pages p where p.parent_id = target_page
        union all
        select p.id from public.journal_pages p join below b on p.parent_id = b.id
      )
      select 1 from below where id = new_parent
    ) then
      raise exception 'A page cannot go inside itself.';
    end if;
  end if;

  select coalesce(array_agg(p.id order by p.position, p.created_at, p.id), '{}')
  into ordered
  from public.journal_pages p
  where p.campaign_id = owning
    and p.parent_id is not distinct from new_parent
    and p.id <> target_page;

  slot := least(greatest(new_position, 0), cardinality(ordered));
  ordered := ordered[1:slot] || target_page || ordered[slot + 1:];

  update public.journal_pages set parent_id = new_parent where id = target_page;

  update public.journal_pages p
  set position = o.place - 1
  from unnest(ordered) with ordinality as o (id, place)
  where p.id = o.id;
end;
$$;

create function public.set_journal_page_revealed(target_page uuid, is_revealed boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_journal_manager(target_page);

  update public.journal_pages set revealed = is_revealed where id = target_page;
end;
$$;

create function public.delete_journal_page(target_page uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_journal_manager(target_page);

  delete from public.journal_pages where id = target_page;
end;
$$;

-- ---------------------------------------------------------------------------
-- Mentions
-- ---------------------------------------------------------------------------

-- A journal page mentions world entries of its own campaign. The document is
-- the source of truth; these tables are derived from it by a trigger, the way
-- world_entry_mentions is.
create table public.journal_page_mentions (
  page_id uuid not null references public.journal_pages (id) on delete cascade,
  target_entry_id uuid not null references public.world_entries (id) on delete cascade,
  primary key (page_id, target_entry_id)
);

create index journal_page_mentions_target_idx
  on public.journal_page_mentions (target_entry_id);

alter table public.journal_page_mentions enable row level security;

-- Each exists() runs the other table's own read policy as the caller, so only
-- people who manage the world read a row.
create policy "Read journal page mentions"
  on public.journal_page_mentions for select
  using (
    exists (select 1 from public.journal_pages p where p.id = page_id)
    and exists (select 1 from public.world_entries t where t.id = target_entry_id)
  );

-- A mention whose entry is not in the campaign stays in the text, shows as
-- plain text, and is remembered here: the entry was deleted, or this is the id
-- of the entry it was copied from. When the entry or a copy of it arrives in
-- the campaign, the mention connects again. Only functions use this table.
create table public.journal_dormant_mentions (
  page_id uuid not null references public.journal_pages (id) on delete cascade,
  origin_entry_id uuid not null,
  -- The origin's lineage as it was when the mention went dormant: once the
  -- origin is deleted, its own row and so its chain are gone.
  lineage uuid[] not null,
  primary key (page_id, origin_entry_id)
);

create index journal_dormant_mentions_lineage_idx
  on public.journal_dormant_mentions using gin (lineage);

alter table public.journal_dormant_mentions enable row level security;

-- Whatever writes a page, its mentions follow.
create function public.sync_journal_page_mentions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ids uuid[];
begin
  select array_agg(distinct (m.v #>> '{}')::uuid) into ids
  from jsonb_path_query(new.content, 'lax $.** ? (@.type == "mention").attrs.id') as m (v)
  where m.v #>> '{}' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  delete from public.journal_page_mentions where page_id = new.id;

  -- Dormant rows go when the mention is no longer in the text, or its entry is
  -- now here. The rest are kept as they are.
  delete from public.journal_dormant_mentions d
  where d.page_id = new.id
    and (
      ids is null
      or d.origin_entry_id <> all (ids)
      or exists (
        select 1 from public.world_entries t
        where t.id = d.origin_entry_id and t.campaign_id = new.campaign_id
      )
    );

  if ids is not null then
    insert into public.journal_page_mentions (page_id, target_entry_id)
    select new.id, t.id
    from unnest(ids) as u (id)
    join public.world_entries t on t.id = u.id
    where t.campaign_id = new.campaign_id;

    insert into public.journal_dormant_mentions (page_id, origin_entry_id, lineage)
    select new.id, u.id, public.entry_lineage(u.id)
    from unnest(ids) as u (id)
    where not exists (
      select 1 from public.world_entries t
      where t.id = u.id and t.campaign_id = new.campaign_id
    )
    on conflict do nothing;
  end if;

  return null;
end;
$$;

create trigger journal_pages_sync_mentions
  after insert or update of content on public.journal_pages
  for each row execute function public.sync_journal_page_mentions();

-- When an entry is deleted, the mentions of it become dormant, with its lineage
-- taken now, while its row is still there. This only inserts, so it cannot meet
-- "tuple already modified" when several entries are deleted together. The pages
-- keep the node with the id of the deleted entry.
create function public.remember_journal_mentions_of_deleted_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.journal_dormant_mentions (page_id, origin_entry_id, lineage)
  select m.page_id, old.id, public.entry_lineage(old.id)
  from public.journal_page_mentions m
  where m.target_entry_id = old.id
  on conflict do nothing;

  return old;
end;
$$;

create trigger world_entries_remember_journal_mentions
  before delete on public.world_entries
  for each row execute function public.remember_journal_mentions_of_deleted_entry();

-- When copies arrive in a campaign, the dormant mentions of its pages that they
-- stand in for connect to them: the copy's lineage and the stored lineage share
-- an id. The first copy to arrive wins. Only the id inside the mention changes.
create function public.reconnect_dormant_journal_mentions(copied_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.journal_pages j
  set content = public.rewrite_mentions(j.content, r.copies, true)
  from (
    select p.page_id, jsonb_object_agg(p.origin_entry_id::text, to_jsonb(p.copy_id::text)) as copies
    from (
      select distinct on (d.page_id, d.origin_entry_id)
        d.page_id, d.origin_entry_id, c.id as copy_id
      from public.journal_dormant_mentions d
      join public.journal_pages jp on jp.id = d.page_id
      join public.world_entries c on c.id = any (copied_ids)
      where c.campaign_id = jp.campaign_id
        and public.entry_lineage(c.id) && d.lineage
      order by d.page_id, d.origin_entry_id, c.created_at, c.id
    ) p
    group by p.page_id
  ) r
  where j.id = r.page_id;
end;
$$;

-- Same body as in 20261102000000, and now the pages of the target campaign
-- reconnect to the copies too. The copy functions call this last.
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
  perform public.reconnect_dormant_journal_mentions(copied_ids);
end;
$$;

-- ---------------------------------------------------------------------------
-- Reading
-- ---------------------------------------------------------------------------

-- A document without its GM-only blocks: gmNote nodes and any node whose
-- attrs.visibility is 'gm'. A node that held blocks and has none left goes too,
-- because an empty list or quote is not a valid document. Null for a removed
-- node. Pure.
create function public.strip_gm_blocks(doc jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  kept jsonb;
begin
  if doc is null then
    return null;
  end if;

  if jsonb_typeof(doc) = 'array' then
    return coalesce(
      (
        select jsonb_agg(s.e order by s.n)
        from (
          select public.strip_gm_blocks(t.e) as e, t.n
          from jsonb_array_elements(doc) with ordinality as t (e, n)
        ) s
        where s.e is not null
      ),
      '[]'::jsonb
    );
  end if;

  if jsonb_typeof(doc) <> 'object' then
    return doc;
  end if;

  if doc ->> 'type' = 'gmNote' or doc #>> '{attrs,visibility}' = 'gm' then
    return null;
  end if;

  if jsonb_typeof(doc -> 'content') = 'array' then
    kept := public.strip_gm_blocks(doc -> 'content');

    if jsonb_array_length(doc -> 'content') > 0 and jsonb_array_length(kept) = 0 then
      return null;
    end if;

    return jsonb_set(doc, '{content}', kept);
  end if;

  return doc;
end;
$$;

-- The pages the caller may open, as a flat list for the tree: all of them for
-- someone who manages the world, only the revealed ones for any other member.
create function public.get_journal_tree(target_campaign uuid)
returns table (
  id uuid,
  parent_id uuid,
  "position" integer,
  title text,
  revealed boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  manager boolean;
begin
  if not public.is_campaign_member(target_campaign) then
    return;
  end if;

  manager := public.has_campaign_permission(target_campaign, 'manage_world');

  return query
  select p.id, p.parent_id, p.position, p.title, p.revealed
  from public.journal_pages p
  where p.campaign_id = target_campaign
    and (manager or p.revealed)
  order by p.parent_id nulls first, p.position, p.created_at;
end;
$$;

-- One page. A manager gets it as written. A player gets a revealed page only,
-- without its GM-only blocks, and a mention stays a link only when its entry is
-- revealed (the rest become plain text), as in get_world_entry_fields.
create function public.get_journal_page(target_page uuid)
returns table (
  id uuid,
  campaign_id uuid,
  parent_id uuid,
  title text,
  content jsonb,
  revealed boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  found_page public.journal_pages;
  manager boolean;
begin
  select * into found_page from public.journal_pages p where p.id = target_page;

  if not found then
    return;
  end if;

  manager := public.has_campaign_permission(found_page.campaign_id, 'manage_world');

  if not manager
     and not (found_page.revealed and public.is_campaign_member(found_page.campaign_id)) then
    return;
  end if;

  return query
  select
    found_page.id,
    found_page.campaign_id,
    found_page.parent_id,
    found_page.title,
    case
      when manager then found_page.content
      else coalesce(
        public.rewrite_mentions(
          public.strip_gm_blocks(found_page.content),
          (
            select coalesce(jsonb_object_agg(t.id::text, to_jsonb(t.id::text)), '{}'::jsonb)
            from public.journal_page_mentions m
            join public.world_entries t on t.id = m.target_entry_id
            where m.page_id = found_page.id
              and t.revealed
              and t.campaign_id = found_page.campaign_id
          )
        ),
        '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
      )
    end,
    found_page.revealed;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.require_journal_manager(uuid),
  public.sync_journal_page_mentions(),
  public.remember_journal_mentions_of_deleted_entry(),
  public.reconnect_dormant_journal_mentions(uuid[]),
  public.strip_gm_blocks(jsonb)
from public, anon, authenticated;

revoke execute on function
  public.create_journal_page(uuid, uuid, text),
  public.set_journal_page_title(uuid, text),
  public.set_journal_page_content(uuid, jsonb),
  public.move_journal_page(uuid, uuid, integer),
  public.set_journal_page_revealed(uuid, boolean),
  public.delete_journal_page(uuid),
  public.get_journal_tree(uuid),
  public.get_journal_page(uuid)
from public, anon;

grant execute on function
  public.create_journal_page(uuid, uuid, text),
  public.set_journal_page_title(uuid, text),
  public.set_journal_page_content(uuid, jsonb),
  public.move_journal_page(uuid, uuid, integer),
  public.set_journal_page_revealed(uuid, boolean),
  public.delete_journal_page(uuid),
  public.get_journal_tree(uuid),
  public.get_journal_page(uuid)
to authenticated;
