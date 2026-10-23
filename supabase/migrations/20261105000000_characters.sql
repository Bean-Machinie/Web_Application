-- Player characters: owned by a person, not by a campaign. What a character looks like
-- (tabs, sections, predefined fields) is the template, which lives in code and is
-- versioned; the database keeps only which template and version a character uses, the
-- fields its player added, and every value, keyed by stable field ids.
--
-- Campaigns will attach characters later; a GM will then be given read access by
-- additional policies, and their own data will live in a separate table.
--
-- A portrait is a file in the world-images bucket under "<user id>/<character id>/",
-- which the existing folder rule (has_world_folder_access) already lets its owner
-- write.

create type public.character_field_type as enum ('stat', 'resource', 'track', 'list', 'text');

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  concept text not null default '' check (char_length(concept) <= 140),
  -- The same shape as an entry's image: its path in storage, url and size.
  portrait jsonb check (portrait is null or pg_column_size(portrait) < 2000),
  template_id text not null check (template_id ~ '^[a-z0-9-]{1,40}$'),
  template_version integer not null check (template_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index characters_owner_idx on public.characters (owner_id, updated_at desc);

-- Fields a player added to a character. Their id is the stable id that values key on.
-- A field's type is fixed once made, as the shape of its value depends on it.
create table public.character_fields (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters (id) on delete cascade,
  tab_id text not null check (tab_id ~ '^[a-z0-9-]{1,40}$'),
  -- Null: directly in the tab. Templates with sections name them.
  section_id text check (section_id is null or section_id ~ '^[a-z0-9-]{1,40}$'),
  type public.character_field_type not null,
  label text not null check (char_length(label) between 1 and 60),
  -- Settings that belong to the field, not its value: a track's length.
  config jsonb not null default '{}'::jsonb check (pg_column_size(config) < 2000),
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create index character_fields_character_idx
  on public.character_fields (character_id, tab_id, sort_order);

-- Every value, for predefined and custom fields alike. A missing row is an empty field.
-- No foreign key to the definitions, as a predefined field's id is code, not a row;
-- removing a custom field deletes its value in the same function.
create table public.character_values (
  character_id uuid not null references public.characters (id) on delete cascade,
  field_id text not null check (field_id ~ '^[a-z0-9_.-]{1,40}$'),
  value jsonb not null default 'null'::jsonb check (pg_column_size(value) < 500000),
  -- Shown as a pill in the header. Null: as the template says (none, for a custom field).
  pinned boolean,
  updated_at timestamptz not null default now(),
  primary key (character_id, field_id)
);

-- Whether the caller owns the character. Every write asks this, so the rule is in one place.
create function public.owns_character(target_character uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.characters
    where id = target_character and owner_id = auth.uid()
  );
$$;

revoke execute on function public.owns_character(uuid) from public, anon;
grant execute on function public.owns_character(uuid) to authenticated;

alter table public.characters enable row level security;
alter table public.character_fields enable row level security;
alter table public.character_values enable row level security;

create policy "Read own characters"
  on public.characters for select
  using (owner_id = auth.uid());

create policy "Read own character fields"
  on public.character_fields for select
  using (public.owns_character(character_id));

create policy "Read own character values"
  on public.character_values for select
  using (public.owns_character(character_id));

-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------

create function public.create_character(
  template text,
  template_ver integer,
  character_name text
)
returns public.characters
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.characters;
begin
  if auth.uid() is null then
    raise exception 'Sign in to create a character.';
  end if;
  if trim(character_name) = '' then
    raise exception 'Give the character a name.';
  end if;

  insert into public.characters (owner_id, name, template_id, template_version)
  values (auth.uid(), trim(character_name), template, template_ver)
  returning * into created;

  return created;
end;
$$;

create function public.rename_character(target_character uuid, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;
  if trim(new_name) = '' then
    raise exception 'Give the character a name.';
  end if;

  update public.characters
  set name = trim(new_name), updated_at = now()
  where id = target_character;
end;
$$;

create function public.set_character_concept(target_character uuid, new_concept text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;

  update public.characters
  set concept = trim(new_concept), updated_at = now()
  where id = target_character;
end;
$$;

create function public.set_character_portrait(target_character uuid, new_portrait jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;

  update public.characters
  set portrait = new_portrait, updated_at = now()
  where id = target_character;
end;
$$;

create function public.delete_character(target_character uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to delete this character.';
  end if;

  delete from public.characters where id = target_character;
end;
$$;

-- Adds a field after the last one in its place.
create function public.add_character_field(
  target_character uuid,
  field_tab text,
  field_section text,
  field_type public.character_field_type,
  field_label text,
  field_config jsonb default '{}'::jsonb
)
returns public.character_fields
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.character_fields;
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;

  insert into public.character_fields
    (character_id, tab_id, section_id, type, label, config, sort_order)
  values (
    target_character, field_tab, field_section, field_type, trim(field_label),
    coalesce(field_config, '{}'::jsonb),
    coalesce(
      (select max(sort_order) from public.character_fields
       where character_id = target_character and tab_id = field_tab), 0
    ) + 1
  )
  returning * into created;

  update public.characters set updated_at = now() where id = target_character;
  return created;
end;
$$;

create function public.update_character_field(
  target_field uuid,
  new_label text,
  new_config jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owning uuid;
begin
  select character_id into owning from public.character_fields where id = target_field;
  if owning is null or not public.owns_character(owning) then
    raise exception 'You are not allowed to change this character.';
  end if;

  update public.character_fields
  set label = trim(new_label), config = coalesce(new_config, config)
  where id = target_field;

  update public.characters set updated_at = now() where id = owning;
end;
$$;

-- Removes the field and its value together.
create function public.remove_character_field(target_field uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owning uuid;
begin
  select character_id into owning from public.character_fields where id = target_field;
  if owning is null or not public.owns_character(owning) then
    raise exception 'You are not allowed to change this character.';
  end if;

  delete from public.character_values
  where character_id = owning and field_id = target_field::text;
  delete from public.character_fields where id = target_field;

  update public.characters set updated_at = now() where id = owning;
end;
$$;

create function public.set_character_value(
  target_character uuid,
  target_field text,
  new_value jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;

  insert into public.character_values (character_id, field_id, value)
  values (target_character, target_field, coalesce(new_value, 'null'::jsonb))
  on conflict (character_id, field_id) do update
  set value = excluded.value, updated_at = now();

  update public.characters set updated_at = now() where id = target_character;
end;
$$;

create function public.set_character_pinned(
  target_character uuid,
  target_field text,
  is_pinned boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;

  insert into public.character_values (character_id, field_id, pinned)
  values (target_character, target_field, is_pinned)
  on conflict (character_id, field_id) do update
  set pinned = excluded.pinned, updated_at = now();

  update public.characters set updated_at = now() where id = target_character;
end;
$$;

revoke execute on function
  public.create_character(text, integer, text),
  public.rename_character(uuid, text),
  public.set_character_concept(uuid, text),
  public.set_character_portrait(uuid, jsonb),
  public.delete_character(uuid),
  public.add_character_field(uuid, text, text, public.character_field_type, text, jsonb),
  public.update_character_field(uuid, text, jsonb),
  public.remove_character_field(uuid),
  public.set_character_value(uuid, text, jsonb),
  public.set_character_pinned(uuid, text, boolean)
from public, anon;

grant execute on function
  public.create_character(text, integer, text),
  public.rename_character(uuid, text),
  public.set_character_concept(uuid, text),
  public.set_character_portrait(uuid, jsonb),
  public.delete_character(uuid),
  public.add_character_field(uuid, text, text, public.character_field_type, text, jsonb),
  public.update_character_field(uuid, text, jsonb),
  public.remove_character_field(uuid),
  public.set_character_value(uuid, text, jsonb),
  public.set_character_pinned(uuid, text, boolean)
to authenticated;
