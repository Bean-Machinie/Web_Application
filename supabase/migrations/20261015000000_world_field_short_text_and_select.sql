-- Two more field types, private-by-default fields, and a read function that
-- tells players a private field exists without sending its value.
--
-- The options of a select live in the kind registry in the app, like which
-- fields may be private; the database stores the chosen key as a JSON string.

alter type public.world_field_type add value 'short_text';
alter type public.world_field_type add value 'select';

-- A field the registry makes private by default must never exist as public,
-- not even for the moment between the first save and the first toggle. The
-- new argument only matters when the row is created.
drop function public.set_world_entry_field_value(
  uuid, text, public.world_field_type, jsonb
);

create function public.set_world_entry_field_value(
  target_entry uuid,
  field_key text,
  field_type public.world_field_type,
  field_value jsonb,
  default_private boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owning uuid;
begin
  select campaign_id into owning from public.world_entries where id = target_entry;

  if owning is null
     or not public.has_campaign_permission(owning, 'manage_world') then
    raise exception 'You are not allowed to change this entry.';
  end if;

  insert into public.world_entry_fields (entry_id, key, type, value, private)
  values (
    target_entry, field_key, field_type,
    coalesce(field_value, 'null'::jsonb), default_private
  )
  on conflict (entry_id, key) do update
  set value = excluded.value, type = excluded.type, updated_at = now();
end;
$$;

revoke execute on function
  public.set_world_entry_field_value(uuid, text, public.world_field_type, jsonb, boolean)
from public, anon;
grant execute on function
  public.set_world_entry_field_value(uuid, text, public.world_field_type, jsonb, boolean)
to authenticated;

-- The fields of one entry as the caller may see them.
--   * Managers get every row with its value.
--   * Everyone else gets public rows with their value, and private rows that
--     hold something with the value nulled out, so the page can show
--     "Undisclosed". Empty private rows are left out: nothing is hidden.
-- It applies the same rule as the "Read world entries" policy, so entries a
-- person cannot see return nothing.
create function public.get_world_entry_fields(target_entry uuid)
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

  if owning is null then
    return;
  end if;

  manager := public.has_campaign_permission(owning, 'manage_world');
  if not manager
     and not (is_revealed and public.is_campaign_member(owning)) then
    return;
  end if;

  return query
  select
    f.key,
    f.type,
    case when f.private and not manager then null::jsonb else f.value end,
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

revoke execute on function public.get_world_entry_fields(uuid) from public, anon;
grant execute on function public.get_world_entry_fields(uuid) to authenticated;
