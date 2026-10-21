-- Old broken mentions. A mention that stopped pointing at anything before dormant
-- mentions existed (its entry was deleted, or copied away without it) left only a
-- node with a dead id in the text: no registry row, and no lineage, because the
-- link from a copy back to its source was cleared when the source was deleted.
--
-- Those are registered once here, with the name the mention had, and marked
-- legacy. When a copy arrives in their home with that same name (ignoring case),
-- they connect to it. Nothing else uses names: a mention that went dormant after
-- 20261102000000 has a lineage and connects by that alone.

alter table public.world_dormant_mentions
  add column label text,
  add column legacy boolean not null default false;

-- Registers every mention in a document whose entry does not exist at all, if it
-- is not registered already. Returns how many were added. Internal only.
create function public.register_legacy_mentions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  added integer;
begin
  insert into public.world_dormant_mentions
    (source_entry_id, field_key, origin_entry_id, lineage, label, legacy)
  select distinct on (f.entry_id, f.key, x.id)
    f.entry_id, f.key, x.id, array[x.id], x.label, true
  from public.world_entry_fields f
  cross join lateral (
    select
      case
        when n.v #>> '{attrs,id}' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then (n.v #>> '{attrs,id}')::uuid
      end as id,
      n.v #>> '{attrs,label}' as label
    from jsonb_path_query(f.value, 'lax $.** ? (@.type == "mention")') as n (v)
  ) x
  where f.type = 'rich_text'
    and x.id is not null
    and not exists (select 1 from public.world_entries t where t.id = x.id)
  order by f.entry_id, f.key, x.id
  on conflict do nothing;

  get diagnostics added = row_count;
  return added;
end;
$$;

revoke execute on function public.register_legacy_mentions() from public, anon, authenticated;

select public.register_legacy_mentions();

-- Reconnecting, as before, and now also by name for the legacy rows: a copy that
-- arrives with the name a legacy mention was given, in the same home.
create or replace function public.reconnect_dormant_mentions(copied_ids uuid[])
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
        and (
          public.entry_lineage(c.id) && d.lineage
          or (d.legacy and d.label is not null and lower(c.name) = lower(d.label))
        )
      order by d.source_entry_id, d.field_key, d.origin_entry_id, c.created_at, c.id
    ) p
    group by p.source_entry_id, p.field_key
  ) r
  where f.entry_id = r.source_entry_id and f.key = r.field_key and f.type = 'rich_text';
end;
$$;
