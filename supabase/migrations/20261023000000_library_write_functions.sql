-- The functions that write to an entry now ask can_manage_entry instead of
-- looking up the campaign themselves, so they work for library entries too.
-- Same signatures as before, so their grants carry over.
--
-- The map functions are left alone on purpose: they only accept campaign
-- entries, and a library cannot hold a map yet.

create or replace function public.rename_world_entry(target_entry uuid, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_entry(target_entry) then
    raise exception 'You are not allowed to change this entry.';
  end if;

  if trim(new_name) = '' then
    raise exception 'Give the entry a name.';
  end if;

  update public.world_entries
  set name = trim(new_name), updated_at = now()
  where id = target_entry;
end;
$$;

create or replace function public.set_world_entry_revealed(
  target_entry uuid,
  is_revealed boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_entry(target_entry) then
    raise exception 'You are not allowed to change this entry.';
  end if;

  if exists (
    select 1 from public.world_entries
    where id = target_entry and owner_id is not null
  ) then
    raise exception 'Library entries cannot be revealed.';
  end if;

  update public.world_entries
  set revealed = is_revealed, updated_at = now()
  where id = target_entry;
end;
$$;

create or replace function public.delete_world_entry(target_entry uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_entry(target_entry) then
    raise exception 'You are not allowed to delete this entry.';
  end if;

  delete from public.world_entries where id = target_entry;
end;
$$;

create or replace function public.set_world_entry_field_value(
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
begin
  if not public.can_manage_entry(target_entry) then
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

create or replace function public.set_world_entry_field_private(
  target_entry uuid,
  field_key text,
  field_type public.world_field_type,
  is_private boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_entry(target_entry) then
    raise exception 'You are not allowed to change this entry.';
  end if;

  insert into public.world_entry_fields (entry_id, key, type, private)
  values (target_entry, field_key, field_type, is_private)
  on conflict (entry_id, key) do update
  set private = excluded.private, updated_at = now();
end;
$$;

-- The fields of one entry as the caller may see them: the same rules as
-- before, with the owner of a library entry counting as its manager.
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

-- ---------------------------------------------------------------------------
-- Library-only functions
-- ---------------------------------------------------------------------------

create function public.create_library_entry(
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
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if entry_kind = 'map' then
    raise exception 'Maps cannot be added to your library yet.';
  end if;

  if trim(entry_name) = '' then
    raise exception 'Give the entry a name.';
  end if;

  insert into public.world_entries (kind, name, owner_id, created_by, sort_order)
  values (
    entry_kind,
    trim(entry_name),
    auth.uid(),
    auth.uid(),
    coalesce(
      (select min(sort_order) from public.world_entries where owner_id = auth.uid()),
      1
    ) - 1
  )
  returning * into created;

  return created;
end;
$$;

-- Takes the caller's entries in their new order. Ids that are not the
-- caller's are ignored.
create function public.reorder_library_entries(ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.world_entries as entry
  set sort_order = ordered.position
  from unnest(ordered_ids) with ordinality as ordered (id, position)
  where entry.id = ordered.id and entry.owner_id = auth.uid();
end;
$$;

revoke execute on function
  public.create_library_entry(public.world_entry_kind, text),
  public.reorder_library_entries(uuid[])
from public, anon;

grant execute on function
  public.create_library_entry(public.world_entry_kind, text),
  public.reorder_library_entries(uuid[])
to authenticated;
