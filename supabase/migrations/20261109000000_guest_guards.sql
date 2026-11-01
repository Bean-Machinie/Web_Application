-- Guests: people who use the app through Supabase anonymous sign-ins.
--
-- A guest has the same "authenticated" role as everyone else, so the only way to
-- tell them apart is the is_anonymous claim in their token. Guests can use their
-- personal features (characters, maps, world entries, library). They cannot
-- upload files, create or join shared campaigns, publish a map, or pick a
-- username. When a guest signs up for real (links Discord or Google, or adds an
-- email) they keep their user id and everything under it, and are given a
-- username then.

-- ---------------------------------------------------------------------------
-- 1. Telling guests apart
-- ---------------------------------------------------------------------------

create function public.is_guest()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

-- Raises for a guest, saying what they would need an account for.
create function public.deny_guest(action text)
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if public.is_guest() then
    raise exception 'Create an account to %.', action
      using errcode = 'insufficient_privilege';
  end if;
end;
$$;

-- Storage policies call is_guest as the signed-in role, so it must be callable.
revoke execute on function public.is_guest(), public.deny_guest(text) from public, anon;
grant execute on function public.is_guest(), public.deny_guest(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Guards in the functions
-- ---------------------------------------------------------------------------

-- Each definition below is its latest one, copied as it was, with a guard as its
-- first statement. The invitation, campaign administration, reveal and copy
-- functions are not repeated: they already fail for a guest, who can be neither
-- a member of a campaign nor invited to one. Grants stay as they are.

-- Shared campaigns. (The one-argument overload was dropped in 20261016, so this is the only one.)
create or replace function public.create_campaign(
  campaign_name text,
  starter_entries jsonb default '[]'::jsonb
)
returns public.campaigns
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_campaign public.campaigns;
  entry jsonb;
  field jsonb;
  entry_fields jsonb;
  new_entry uuid;
  position integer := 0;
begin
  perform public.deny_guest('create a campaign');
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if jsonb_typeof(starter_entries) is distinct from 'array'
     or jsonb_array_length(starter_entries) > 50 then
    raise exception 'A template can hold at most 50 entries.';
  end if;

  insert into public.campaigns (name, created_by)
  values (trim(campaign_name), auth.uid())
  returning * into new_campaign;

  insert into public.campaign_members (campaign_id, user_id, role)
  values (new_campaign.id, auth.uid(), 'gm');

  insert into public.campaign_invites (campaign_id)
  values (new_campaign.id);

  for entry in select value from jsonb_array_elements(starter_entries) loop
    entry_fields := coalesce(entry -> 'fields', '[]'::jsonb);

    if jsonb_typeof(entry_fields) is distinct from 'array'
       or jsonb_array_length(entry_fields) > 20 then
      raise exception 'An entry can hold at most 20 fields.';
    end if;

    if trim(coalesce(entry ->> 'name', '')) = '' then
      raise exception 'Every starter entry needs a name.';
    end if;

    insert into public.world_entries (kind, name, campaign_id, created_by, sort_order)
    values (
      (entry ->> 'kind')::public.world_entry_kind,
      trim(entry ->> 'name'),
      new_campaign.id,
      auth.uid(),
      position
    )
    returning id into new_entry;

    position := position + 1;

    for field in select value from jsonb_array_elements(entry_fields) loop
      insert into public.world_entry_fields (entry_id, key, type, value, private)
      values (
        new_entry,
        field ->> 'key',
        (field ->> 'type')::public.world_field_type,
        coalesce(field -> 'value', 'null'::jsonb),
        coalesce((field ->> 'private')::boolean, false)
      );
    end loop;
  end loop;

  return new_campaign;
end;
$$;

create or replace function public.join_campaign(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  perform public.deny_guest('join a campaign');
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select campaign_id into target
  from public.campaign_invites
  where code = trim(invite_code);

  if target is null then
    raise exception 'That invite link is not valid.';
  end if;

  insert into public.campaign_members (campaign_id, user_id, role)
  values (target, auth.uid(), 'player')
  on conflict (campaign_id, user_id) do nothing;

  update public.campaign_invitations
  set status = 'accepted', responded_at = now()
  where campaign_id = target
    and invitee_id = auth.uid()
    and status = 'pending';

  return target;
end;
$$;

-- A username comes when the guest signs up.
create or replace function public.set_username(new_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text := regexp_replace(btrim(new_username), '\s+', ' ', 'g');
begin
  perform public.deny_guest('choose a username');
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if cleaned !~ '^[^@[:cntrl:]]{2,50}$' then
    raise exception 'Usernames are 2 to 50 characters and cannot contain @.';
  end if;

  update public.profiles set username = cleaned where id = auth.uid();
exception when unique_violation then
  raise exception 'That username is taken.';
end;
$$;

-- Saving a map is fine for a guest. Publishing (mark_rendered) shows it to others and needs an uploaded picture.
create or replace function public.save_map_scene(
  target_map uuid,
  new_scene jsonb,
  expected_updated_at timestamptz default null,
  mark_rendered boolean default false
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  map_kind public.world_entry_kind;
  current_updated timestamptz;
  saved timestamptz := clock_timestamp();
begin
  if mark_rendered then perform public.deny_guest('publish a map'); end if;
  if not public.can_manage_entry(target_map) then
    raise exception 'You are not allowed to change this map.';
  end if;

  select kind into map_kind from public.world_entries where id = target_map;

  if map_kind <> 'map' then
    raise exception 'That entry is not a map.';
  end if;

  if jsonb_typeof(new_scene) <> 'object'
     or jsonb_typeof(new_scene -> 'version') <> 'number' then
    raise exception 'That is not a map scene.';
  end if;

  -- A few megabytes is plenty of shapes; this only stops runaway documents.
  if octet_length(new_scene::text) > 8 * 1024 * 1024 then
    raise exception 'This scene is too large to save.';
  end if;

  select updated_at into current_updated
  from public.world_map_scenes where map_id = target_map for update;

  if not found then
    if expected_updated_at is not null then
      raise exception 'This map was changed somewhere else. Reload it to continue.';
    end if;

    insert into public.world_map_scenes
      (map_id, scene, scene_version, updated_at, updated_by, rendered_at)
    values (
      target_map,
      new_scene,
      (new_scene ->> 'version')::integer,
      saved,
      auth.uid(),
      case when mark_rendered then saved end
    );
  else
    if expected_updated_at is distinct from current_updated then
      raise exception 'This map was changed somewhere else. Reload it to continue.';
    end if;

    update public.world_map_scenes
    set scene = new_scene,
        scene_version = (new_scene ->> 'version')::integer,
        updated_at = saved,
        updated_by = auth.uid(),
        rendered_at = case when mark_rendered then saved else rendered_at end
    where map_id = target_map;
  end if;

  -- Only a published map changes what everyone sees.
  if mark_rendered then
    update public.world_entries set updated_at = now() where id = target_map;
  end if;

  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Guests cannot upload
-- ---------------------------------------------------------------------------

-- A restrictive policy must pass as well as the existing ones. Each is limited to
-- its own bucket, so nothing else is affected. Reading and deleting stay as they
-- are: files are public to read, and a guest has none of their own to delete.
do $$
declare
  bucket text;
begin
  foreach bucket in array array['avatars', 'campaign-images', 'world-images', 'world-maps']
  loop
    execute format('drop policy if exists %I on storage.objects', 'Guests cannot upload to ' || bucket);
    execute format('drop policy if exists %I on storage.objects', 'Guests cannot replace files in ' || bucket);

    execute format(
      'create policy %I on storage.objects as restrictive for insert to authenticated
         with check (bucket_id <> %L or not public.is_guest())',
      'Guests cannot upload to ' || bucket, bucket
    );
    execute format(
      'create policy %I on storage.objects as restrictive for update to authenticated
         using (bucket_id <> %L or not public.is_guest())
         with check (bucket_id <> %L or not public.is_guest())',
      'Guests cannot replace files in ' || bucket, bucket, bucket
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Profiles and usernames
-- ---------------------------------------------------------------------------

-- Gives a person a username by the same rules as sign-up (see oauth_usernames),
-- reading what a linked provider knows as well as their metadata. Does nothing
-- if they have one. Returns the username, or null if every try was taken.
create function public.assign_username(uid uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  account record;
  meta jsonb;
  base text;
  attempt int := 0;
  violated text;
  current_name text;
begin
  select username into current_name from public.profiles where id = uid;
  if current_name is not null then
    return current_name;
  end if;

  select u.email, coalesce(u.raw_user_meta_data, '{}'::jsonb) as meta
  into account
  from auth.users u
  where u.id = uid;

  if not found then
    return null;
  end if;

  -- What the linked providers sent, with the account's own metadata on top (so a
  -- username chosen on the sign-up form wins).
  select coalesce(jsonb_object_agg(k, v order by made), '{}'::jsonb)
  into meta
  from (
    select e.key as k, e.value as v, i.created_at as made
    from auth.identities i, jsonb_each(coalesce(i.identity_data, '{}'::jsonb)) e
    where i.user_id = uid
  ) identity_fields;

  base := public.username_base(meta || account.meta, account.email);

  loop
    attempt := attempt + 1;

    begin
      update public.profiles
      set username = public.username_candidate(base, attempt, uid)
      where id = uid and username is null
      returning username into current_name;
      return current_name;
    exception when unique_violation then
      get stacked diagnostics violated = constraint_name;
      if violated is distinct from 'profiles_username_key' then
        raise;
      end if;

      -- Out of tries: they can choose one themselves later.
      if attempt > 20 then
        return null;
      end if;
    end;
  end loop;
end;
$$;

revoke execute on function public.assign_username(uuid) from public, anon, authenticated;

-- The backup for the trigger below, which may run before a linked provider's
-- identity has been saved. The app calls it once after someone becomes a full
-- account. It is safe to call again.
create function public.ensure_username()
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  perform public.deny_guest('choose a username');

  return public.assign_username(auth.uid());
end;
$$;

revoke execute on function public.ensure_username() from public, anon;
grant execute on function public.ensure_username() to authenticated;

-- New accounts. A guest gets a profile with no username and no email; they are
-- given a username when they sign up for real. For everyone else this is as
-- before.
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
  if new.is_anonymous then
    insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
    return new;
  end if;

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

-- Keeps profiles in step with the account, and names a guest who has just
-- become a full account.
create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      avatar_url = nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  where id = new.id;

  if old.is_anonymous and not new.is_anonymous then
    perform public.assign_username(new.id);
  end if;

  return new;
end;
$$;

drop trigger on_auth_user_updated on auth.users;

create trigger on_auth_user_updated
  after update of email, raw_user_meta_data, is_anonymous on auth.users
  for each row execute function public.sync_profile_from_auth();

-- ---------------------------------------------------------------------------
-- 5. Clearing out guests who have gone
-- ---------------------------------------------------------------------------

-- last_sign_in_at does not move while a guest's session keeps refreshing, so
-- the app says when it last saw them.
alter table public.profiles
  add column last_seen_at timestamptz not null default now();

-- At most once a day, whatever the app does, so it costs next to nothing.
create function public.touch_guest()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set last_seen_at = now()
  where id = auth.uid()
    and last_seen_at < now() - interval '1 day';
$$;

revoke execute on function public.touch_guest() from public, anon;
grant execute on function public.touch_guest() to authenticated;

-- Everything a guest made goes with them: their rows are removed along with
-- their user, and they cannot have uploaded files.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'delete-inactive-guests',
  '17 3 * * *',
  $job$
    delete from auth.users u
    using public.profiles p
    where p.id = u.id
      and u.is_anonymous
      and p.last_seen_at < now() - interval '30 days'
  $job$
);
