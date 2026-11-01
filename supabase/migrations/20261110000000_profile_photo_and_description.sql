-- A person's photo and description now live in profiles, which is the only place
-- the app reads them from. User metadata can be edited by the person, and a
-- provider rewrites its avatar_url each time they log in with it, so it cannot be
-- trusted to hold a choice. This runs after the guest migration, whose
-- assign_username it relies on.

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column avatar_path text,
  add column description text not null default '';

alter table public.profiles
  add constraint profiles_description_length check (char_length(description) <= 160);

-- ---------------------------------------------------------------------------
-- 2. Existing accounts
-- ---------------------------------------------------------------------------

-- avatar_url was already copied across by the sync trigger. The path is only
-- taken when it is the file the URL points to: a provider login may have
-- replaced the URL with its own picture since the photo was uploaded.
update public.profiles p
set description = left(btrim(coalesce(u.raw_user_meta_data ->> 'description', '')), 160),
    avatar_url = coalesce(p.avatar_url, nullif(u.raw_user_meta_data ->> 'avatar_url', '')),
    avatar_path = case
      when nullif(u.raw_user_meta_data ->> 'avatar_path', '') is not null
        and right(
          coalesce(p.avatar_url, u.raw_user_meta_data ->> 'avatar_url', ''),
          length(u.raw_user_meta_data ->> 'avatar_path')
        ) = u.raw_user_meta_data ->> 'avatar_path'
      then u.raw_user_meta_data ->> 'avatar_path'
    end
from auth.users u
where u.id = p.id;

-- ---------------------------------------------------------------------------
-- 3. Setting them
-- ---------------------------------------------------------------------------

-- Saves a photo the app has already uploaded to the person's own folder in the
-- avatars bucket, or removes it when given null. The app never sends a URL: it
-- is built here from the path, on the project's own address (the token's issuer,
-- which the client cannot change). Deleting the old file is the app's job.
create function public.set_avatar(new_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  issuer text := auth.jwt() ->> 'iss';
begin
  perform public.deny_guest('set a photo');

  if me is null then
    raise exception 'You must be signed in.';
  end if;

  if new_path is null then
    update public.profiles set avatar_url = null, avatar_path = null where id = me;
    return;
  end if;

  -- "<user id>/<timestamp>.<extension>", which is what the app uploads.
  if new_path !~ ('^' || me::text || '/[0-9]+\.[a-z]{3,4}$') then
    raise exception 'That photo is not in your folder.';
  end if;

  if not exists (
    select 1 from storage.objects where bucket_id = 'avatars' and name = new_path
  ) then
    raise exception 'That photo has not been uploaded.';
  end if;

  if issuer is null or issuer !~ '/auth/v1/?$' then
    raise exception 'Could not work out where photos are kept.';
  end if;

  update public.profiles
  set avatar_path = new_path,
      avatar_url = regexp_replace(issuer, '/auth/v1/?$', '')
        || '/storage/v1/object/public/avatars/' || new_path
  where id = me;
end;
$$;

create function public.set_description(new_description text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text := btrim(coalesce(new_description, ''));
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if char_length(cleaned) > 160 then
    raise exception 'Descriptions are up to 160 characters.';
  end if;

  update public.profiles set description = cleaned where id = auth.uid();
end;
$$;

revoke execute on function public.set_avatar(text), public.set_description(text) from public, anon;
grant execute on function public.set_avatar(text), public.set_description(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. The sync trigger no longer touches a photo
-- ---------------------------------------------------------------------------

-- The email is kept in step as before. The photo is not copied on ordinary updates,
-- so one the person chose is never replaced and one they removed stays removed. A
-- guest who has just become a full account is given a username, and a starting
-- picture from the provider they linked, if they have none. (New accounts get theirs
-- from handle_new_user.)
create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  if old.is_anonymous and not new.is_anonymous then
    update public.profiles
    set avatar_url = coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      (
        select nullif(i.identity_data ->> 'avatar_url', '')
        from auth.identities i
        where i.user_id = new.id
        order by i.created_at desc
        limit 1
      )
    )
    where id = new.id and avatar_url is null;

    perform public.assign_username(new.id);
  end if;

  return new;
end;
$$;
