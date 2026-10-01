-- Fields of a world entry, one row per field so the database can filter them
-- one by one. Which fields a kind has, and which of them may be private, is
-- decided by the kind registry in the app; this table only stores the data.
--
-- A missing row means an empty field with the registry's defaults, so rows
-- are created by the first save.
--
-- A private field is visible only to people with manage_world, even when its
-- entry is revealed.

create type public.world_field_type as enum ('rich_text');

create table public.world_entry_fields (
  entry_id uuid not null references public.world_entries (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 40),
  type public.world_field_type not null,
  -- Shape depends on type, so more types need no schema change.
  value jsonb not null default 'null'::jsonb check (pg_column_size(value) < 500000),
  private boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (entry_id, key)
);

-- Security definer so the lookup does not depend on who may read the entry.
create function public.world_entry_campaign(entry uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select campaign_id from public.world_entries where id = entry;
$$;

revoke execute on function public.world_entry_campaign(uuid) from public, anon;
grant execute on function public.world_entry_campaign(uuid) to authenticated;

alter table public.world_entry_fields enable row level security;

-- The exists() runs the entry's own read policy, so fields of an entry a
-- person cannot see stay hidden too.
create policy "Read world entry fields"
  on public.world_entry_fields for select
  using (
    public.has_campaign_permission(
      public.world_entry_campaign(entry_id), 'manage_world'
    )
    or (
      not private
      and exists (select 1 from public.world_entries e where e.id = entry_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------

create function public.set_world_entry_field_value(
  target_entry uuid,
  field_key text,
  field_type public.world_field_type,
  field_value jsonb
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

  insert into public.world_entry_fields (entry_id, key, type, value)
  values (target_entry, field_key, field_type, coalesce(field_value, 'null'::jsonb))
  on conflict (entry_id, key) do update
  set value = excluded.value, type = excluded.type, updated_at = now();
end;
$$;

create function public.set_world_entry_field_private(
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
declare
  owning uuid;
begin
  select campaign_id into owning from public.world_entries where id = target_entry;

  if owning is null
     or not public.has_campaign_permission(owning, 'manage_world') then
    raise exception 'You are not allowed to change this entry.';
  end if;

  insert into public.world_entry_fields (entry_id, key, type, private)
  values (target_entry, field_key, field_type, is_private)
  on conflict (entry_id, key) do update
  set private = excluded.private, updated_at = now();
end;
$$;

revoke execute on function
  public.set_world_entry_field_value(uuid, text, public.world_field_type, jsonb),
  public.set_world_entry_field_private(uuid, text, public.world_field_type, boolean)
from public, anon;

grant execute on function
  public.set_world_entry_field_value(uuid, text, public.world_field_type, jsonb),
  public.set_world_entry_field_private(uuid, text, public.world_field_type, boolean)
to authenticated;
