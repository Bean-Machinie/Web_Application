-- A GM-chosen order for world entries. Until now the list sorted by what was
-- updated most recently.

alter table public.world_entries
  add column sort_order integer not null default 0;

-- Keep today's order: most recently updated first.
update public.world_entries as entry
set sort_order = ranked.position
from (
  select id, row_number() over (partition by campaign_id order by updated_at desc) as position
  from public.world_entries
) as ranked
where entry.id = ranked.id;

-- Same body as before, plus a place at the top of the list for the new entry.
create or replace function public.create_world_entry(
  target_campaign uuid,
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
  if not public.has_campaign_permission(target_campaign, 'manage_world') then
    raise exception 'You are not allowed to add to this world.';
  end if;

  if trim(entry_name) = '' then
    raise exception 'Give the entry a name.';
  end if;

  insert into public.world_entries (kind, name, campaign_id, created_by, sort_order)
  values (
    entry_kind,
    trim(entry_name),
    target_campaign,
    auth.uid(),
    coalesce(
      (select min(sort_order) from public.world_entries where campaign_id = target_campaign),
      1
    ) - 1
  )
  returning * into created;

  return created;
end;
$$;

-- Takes the campaign's entries in their new order. It does not stamp
-- updated_at: moving an entry is not editing it.
create function public.reorder_world_entries(target_campaign uuid, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_campaign_permission(target_campaign, 'manage_world') then
    raise exception 'You are not allowed to reorder this world.';
  end if;

  update public.world_entries as entry
  set sort_order = ordered.position
  from unnest(ordered_ids) with ordinality as ordered (id, position)
  where entry.id = ordered.id and entry.campaign_id = target_campaign;
end;
$$;

revoke execute on function public.reorder_world_entries(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_world_entries(uuid, uuid[]) to authenticated;
