-- World entries: the things a GM builds for a campaign. One table holds every
-- kind of entry and only what they all share. A new kind (location, map,
-- handout) is one more value in world_entry_kind, plus its own table for
-- kind-specific fields keyed by the entry id; this table does not change.
--
-- Hidden entries are GM-only, revealed ones are visible to every member.
-- Writes only happen through the functions below, like the campaign tables.

create type public.world_entry_kind as enum ('npc');

create table public.world_entries (
  id uuid primary key default gen_random_uuid(),
  kind public.world_entry_kind not null,
  name text not null check (char_length(name) between 1 and 80),
  -- Exactly one owner. A campaign today; a user's library later, which will
  -- set owner_id instead and get its own read policy.
  campaign_id uuid references public.campaigns (id) on delete cascade,
  owner_id uuid references auth.users (id) on delete cascade,
  revealed boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((campaign_id is not null) <> (owner_id is not null))
);

create index world_entries_campaign_idx
  on public.world_entries (campaign_id, created_at desc);

-- One permission for everything a GM does to entries. Split it when another
-- role needs some of it but not all.
insert into public.campaign_role_permissions (role, permission)
values ('gm', 'manage_world');

alter table public.world_entries enable row level security;

-- GMs see every entry in their campaign; everyone else sees revealed ones.
-- Rows owned by a user (owner_id) match nothing until a library policy exists.
create policy "Read world entries"
  on public.world_entries for select
  using (
    campaign_id is not null and (
      public.has_campaign_permission(campaign_id, 'manage_world')
      or (revealed and public.is_campaign_member(campaign_id))
    )
  );

-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------

create function public.create_world_entry(
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

  insert into public.world_entries (kind, name, campaign_id, created_by)
  values (entry_kind, trim(entry_name), target_campaign, auth.uid())
  returning * into created;

  return created;
end;
$$;

-- The three functions below look the entry up first, so the permission is
-- checked against the campaign the entry actually belongs to.
create function public.rename_world_entry(target_entry uuid, new_name text)
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

  if trim(new_name) = '' then
    raise exception 'Give the entry a name.';
  end if;

  update public.world_entries set name = trim(new_name) where id = target_entry;
end;
$$;

create function public.set_world_entry_revealed(
  target_entry uuid,
  is_revealed boolean
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

  update public.world_entries
  set revealed = is_revealed
  where id = target_entry;
end;
$$;

create function public.delete_world_entry(target_entry uuid)
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
    raise exception 'You are not allowed to delete this entry.';
  end if;

  delete from public.world_entries where id = target_entry;
end;
$$;

revoke execute on function
  public.create_world_entry(uuid, public.world_entry_kind, text),
  public.rename_world_entry(uuid, text),
  public.set_world_entry_revealed(uuid, boolean),
  public.delete_world_entry(uuid)
from public, anon;

grant execute on function
  public.create_world_entry(uuid, public.world_entry_kind, text),
  public.rename_world_entry(uuid, text),
  public.set_world_entry_revealed(uuid, boolean),
  public.delete_world_entry(uuid)
to authenticated;
