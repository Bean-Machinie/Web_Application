-- Your library: a user's own collection of world entries, reusable across
-- campaigns. A library entry is a world_entries row with owner_id set instead
-- of campaign_id, so it has the same kinds, fields and pages as the World.
--
-- Moving an entry between a library and a campaign always copies it. The copy
-- remembers where it came from in source_entry_id, which lets an "update from
-- library" be added later without a change here.
--
-- Only the owner ever sees a library entry. Library entries are never
-- revealed, and in this first version they cannot be maps.

alter table public.world_entries
  add column source_entry_id uuid references public.world_entries (id) on delete set null;

-- Maps need their markers and scene copied too, which comes later. Until then
-- the map functions stay campaign-only, and this keeps a map out of any library.
alter table public.world_entries
  add constraint world_entries_library_not_map check (owner_id is null or kind <> 'map');

-- Revealing is for campaigns; in a library it would mean nothing.
alter table public.world_entries
  add constraint world_entries_library_not_revealed check (owner_id is null or not revealed);

create index world_entries_owner_idx
  on public.world_entries (owner_id, sort_order);

create index world_entries_source_idx
  on public.world_entries (source_entry_id);

-- Whether the caller may change an entry: the owner of a library entry, or
-- someone who manages the world of the entry's campaign. Every function that
-- writes to an entry asks this, so the rule lives in one place.
create function public.can_manage_entry(target_entry uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  entry_owner uuid;
  entry_campaign uuid;
begin
  select owner_id, campaign_id into entry_owner, entry_campaign
  from public.world_entries
  where id = target_entry;

  if not found then
    return false;
  end if;

  if entry_owner is not null then
    return entry_owner = auth.uid();
  end if;

  return public.has_campaign_permission(entry_campaign, 'manage_world');
end;
$$;

revoke execute on function public.can_manage_entry(uuid) from public, anon;
grant execute on function public.can_manage_entry(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Read policies
-- ---------------------------------------------------------------------------

drop policy "Read world entries" on public.world_entries;

-- GMs see every entry in their campaign; everyone else sees revealed ones.
-- Library entries are read by their owner and nobody else.
create policy "Read world entries"
  on public.world_entries for select
  using (
    owner_id = auth.uid()
    or (
      campaign_id is not null and (
        public.has_campaign_permission(campaign_id, 'manage_world')
        or (revealed and public.is_campaign_member(campaign_id))
      )
    )
  );

drop policy "Read world entry fields" on public.world_entry_fields;

-- The exists() runs the entry's own read policy, so fields of an entry a
-- person cannot see stay hidden too.
create policy "Read world entry fields"
  on public.world_entry_fields for select
  using (
    public.can_manage_entry(entry_id)
    or (
      not private
      and exists (select 1 from public.world_entries e where e.id = entry_id)
    )
  );
