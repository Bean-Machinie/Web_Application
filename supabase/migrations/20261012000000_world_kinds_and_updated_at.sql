-- More kinds of world entry, and an updated_at stamp so the World page can
-- sort by what changed most recently.

-- Existing NPCs become characters; the rename updates their rows in place.
alter type public.world_entry_kind rename value 'npc' to 'character';
alter type public.world_entry_kind add value 'creature';
alter type public.world_entry_kind add value 'location';
alter type public.world_entry_kind add value 'item';
alter type public.world_entry_kind add value 'lore';

alter table public.world_entries
  add column updated_at timestamptz not null default now();

update public.world_entries set updated_at = created_at;

-- Same bodies as before, plus the stamp.
create or replace function public.rename_world_entry(target_entry uuid, new_name text)
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
declare
  owning uuid;
begin
  select campaign_id into owning from public.world_entries where id = target_entry;

  if owning is null
     or not public.has_campaign_permission(owning, 'manage_world') then
    raise exception 'You are not allowed to change this entry.';
  end if;

  update public.world_entries
  set revealed = is_revealed, updated_at = now()
  where id = target_entry;
end;
$$;

-- Editing a field, or toggling its privacy, counts as updating its entry.
create function public.touch_world_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.world_entries set updated_at = now() where id = new.entry_id;
  return new;
end;
$$;

create trigger world_entry_fields_touch_entry
  after insert or update on public.world_entry_fields
  for each row execute function public.touch_world_entry();
