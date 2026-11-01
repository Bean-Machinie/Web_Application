-- People who sign up with Discord or Google never fill in our form, so they
-- arrive with no "username" metadata. Give them one from what the provider
-- sent, falling back to the email prefix.
--
-- The metadata is only a suggestion read once, here. After this the name lives
-- in profiles.username alone: user metadata is editable by the user, so the app
-- reads the name from the profiles table, never from metadata.
--
-- profiles_username_key (unique on lower(username)) already exists from the
-- username migration, so nothing new is needed for uniqueness.

-- ---------------------------------------------------------------------------
-- 1. Shared rules
-- ---------------------------------------------------------------------------

-- Fits profiles_username_format: no "@" or control characters, single spaces,
-- trimmed, at most 50 characters.
create function public.clean_username(raw text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(left(btrim(regexp_replace(
    regexp_replace(coalesce(raw, ''), '[@[:cntrl:]]', '', 'g'),
    '\s+', ' ', 'g')), 50));
$$;

-- The first usable name, in order: the sign-up form's username, Discord's
-- global name, the provider's full name, its name, the email prefix.
create function public.username_base(meta jsonb, email text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  candidate text;
  cleaned text;
begin
  foreach candidate in array array[
    meta ->> 'username',
    meta #>> '{custom_claims,global_name}',
    meta ->> 'full_name',
    meta ->> 'name',
    split_part(coalesce(email, ''), '@', 1)
  ] loop
    cleaned := public.clean_username(candidate);
    if length(cleaned) >= 2 then
      return cleaned;
    end if;
  end loop;

  return 'Player';
end;
$$;

-- Attempt 1 is the name itself, 2 to 20 add a number ("Sam2"), anything later
-- adds the first 6 characters of the user id.
create function public.username_candidate(base text, attempt int, uid uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when attempt <= 1 then base
    else btrim(left(base, 50 - length(s.suffix))) || s.suffix
  end
  from (
    select case when attempt <= 20 then attempt::text else left(uid::text, 6) end as suffix
  ) s;
$$;

revoke execute on function
  public.clean_username(text),
  public.username_base(jsonb, text),
  public.username_candidate(text, int, uuid)
from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. New accounts
-- ---------------------------------------------------------------------------

-- Retries only when the username is taken, up to 20 tries, then falls back to
-- the name plus part of the user id. If even that is taken the account is
-- created without a username rather than failing sign-up. Any other unique
-- violation is raised. A duplicate id is skipped by on conflict, never looped.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := public.username_base(new.raw_user_meta_data, new.email);
  avatar text := nullif(new.raw_user_meta_data ->> 'avatar_url', '');
  attempt int := 0;
  violated text;
begin
  loop
    attempt := attempt + 1;

    begin
      insert into public.profiles (id, email, username, avatar_url)
      values (new.id, new.email, public.username_candidate(base, attempt, new.id), avatar)
      on conflict (id) do nothing;
      exit;
    exception when unique_violation then
      get stacked diagnostics violated = constraint_name;
      if violated is distinct from 'profiles_username_key' then
        raise;
      end if;

      if attempt > 20 then
        insert into public.profiles (id, email, avatar_url)
        values (new.id, new.email, avatar)
        on conflict (id) do nothing;
        exit;
      end if;
    end;
  end loop;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Existing accounts with no username
-- ---------------------------------------------------------------------------

do $$
declare
  person record;
  attempt int;
  violated text;
begin
  for person in
    select p.id, u.email, u.raw_user_meta_data as meta
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.username is null
    order by p.created_at
  loop
    attempt := 0;

    loop
      attempt := attempt + 1;

      begin
        update public.profiles
        set username = public.username_candidate(
          public.username_base(person.meta, person.email), attempt, person.id)
        where id = person.id and username is null;
        exit;
      exception when unique_violation then
        get stacked diagnostics violated = constraint_name;
        if violated is distinct from 'profiles_username_key' then
          raise;
        end if;

        -- Out of tries: leave this one without a username, as before.
        exit when attempt > 20;
      end;
    end loop;
  end loop;
end;
$$;
