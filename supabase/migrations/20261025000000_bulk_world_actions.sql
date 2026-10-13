-- Reveal, hide and delete many entries in one call, for the bulk actions of the
-- World and library lists. Each call succeeds or fails as a whole: if the
-- caller may not change one of the entries, or one does not exist, nothing is
-- changed, and the error does not say which, so it cannot be used to find out
-- that a hidden entry exists.
--
-- The single-entry functions stay for changing one entry.

-- Checks the caller may change every one of these entries. The ids are
-- distinct and at most 200; a library entry counts when it is the caller's, a
-- campaign entry when the caller holds manage_world on its campaign.
create function public.check_entries_manageable(entry_ids uuid[])
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  manageable integer;
begin
  if cardinality(entry_ids) > 200 then
    raise exception 'Select at most 200 entries at a time.';
  end if;

  select count(*) into manageable
  from public.world_entries e
  where e.id = any (entry_ids)
    and (
      e.owner_id = auth.uid()
      or (
        e.owner_id is null
        and public.has_campaign_permission(e.campaign_id, 'manage_world')
      )
    );

  if manageable <> cardinality(entry_ids) then
    raise exception 'You are not allowed to change these entries.';
  end if;
end;
$$;

-- Only the functions below call it.
revoke execute on function public.check_entries_manageable(uuid[]) from public, anon, authenticated;

-- Returns how many entries changed: those already in the wanted state are left
-- as they are, with their updated_at.
create function public.set_world_entries_revealed(
  target_entries uuid[],
  is_revealed boolean
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry_ids uuid[] := array(select distinct unnest(coalesce(target_entries, '{}'::uuid[])));
  changed integer;
begin
  perform public.check_entries_manageable(entry_ids);

  if exists (
    select 1 from public.world_entries
    where id = any (entry_ids) and owner_id is not null
  ) then
    raise exception 'Library entries cannot be revealed.';
  end if;

  update public.world_entries
  set revealed = is_revealed, updated_at = now()
  where id = any (entry_ids) and revealed is distinct from is_revealed;

  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Returns how many entries were deleted. Their fields, markers and scenes go
-- with them; the image files are removed by the app afterwards.
create function public.delete_world_entries(target_entries uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry_ids uuid[] := array(select distinct unnest(coalesce(target_entries, '{}'::uuid[])));
  removed integer;
begin
  perform public.check_entries_manageable(entry_ids);

  delete from public.world_entries where id = any (entry_ids);

  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke execute on function
  public.set_world_entries_revealed(uuid[], boolean),
  public.delete_world_entries(uuid[])
from public, anon;

grant execute on function
  public.set_world_entries_revealed(uuid[], boolean),
  public.delete_world_entries(uuid[])
to authenticated;
