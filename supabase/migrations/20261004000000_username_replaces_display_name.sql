-- One name per person: the username. It replaces the display name, and is
-- what people search for to invite you and what is shown everywhere.
--
-- Usernames are now free-form, like the old display name: 2 to 50
-- characters, spaces and capitals allowed, shown as typed. They stay unique
-- ignoring capitals ("Bob" and "bob" are the same name). They cannot contain
-- "@", so a username can never be mistaken for an email address in the invite
-- search.

-- ---------------------------------------------------------------------------
-- 1. Functions first, so nothing refers to display_name when it is dropped
-- ---------------------------------------------------------------------------

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

  return new;
end;
$$;

-- A username chosen at sign-up comes in as user metadata. If it is invalid or
-- taken the account is still created, without one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := regexp_replace(
    btrim(coalesce(new.raw_user_meta_data ->> 'username', '')), '\s+', ' ', 'g'
  );
begin
  begin
    insert into public.profiles (id, email, username)
    values (new.id, new.email, nullif(wanted, ''));
  exception when unique_violation or check_violation then
    insert into public.profiles (id, email)
    values (new.id, new.email);
  end;

  return new;
end;
$$;

create or replace function public.set_username(new_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text := regexp_replace(btrim(new_username), '\s+', ' ', 'g');
begin
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

create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select regexp_replace(btrim(candidate), '\s+', ' ', 'g') ~ '^[^@[:cntrl:]]{2,50}$'
    and not exists (
      select 1 from public.profiles
      where lower(username) = lower(regexp_replace(btrim(candidate), '\s+', ' ', 'g'))
    );
$$;

-- Exact match on the full email or the whole username, ignoring capitals.
-- Still no browsing. The return shape changes (no display name), so the old
-- function is dropped and recreated.
drop function public.find_invitee(uuid, text);

create function public.find_invitee(target_campaign uuid, search text)
returns table (
  id uuid,
  username text,
  avatar_url text,
  is_member boolean,
  has_pending boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  q text := regexp_replace(lower(btrim(search)), '\s+', ' ', 'g');
begin
  if not public.has_campaign_permission(target_campaign, 'invite') then
    raise exception 'You are not allowed to invite people to this campaign.';
  end if;

  if q = '' then
    return;
  end if;

  return query
    select
      p.id,
      p.username,
      p.avatar_url,
      exists (
        select 1 from public.campaign_members m
        where m.campaign_id = target_campaign and m.user_id = p.id
      ),
      exists (
        select 1 from public.campaign_invitations i
        where i.campaign_id = target_campaign
          and i.invitee_id = p.id
          and i.status = 'pending'
      )
    from public.profiles p
    where p.id <> auth.uid()
      and (lower(p.email) = q or lower(p.username) = ltrim(q, '@'));
end;
$$;

drop function public.campaign_pending_invitations(uuid);

create function public.campaign_pending_invitations(target_campaign uuid)
returns table (
  id uuid,
  invitee_username text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_campaign_permission(target_campaign, 'invite') then
    raise exception 'You are not allowed to see this campaign''s invitations.';
  end if;

  return query
    select i.id, p.username, i.created_at
    from public.campaign_invitations i
    join public.profiles p on p.id = i.invitee_id
    where i.campaign_id = target_campaign
      and i.status = 'pending'
    order by i.created_at desc;
end;
$$;

create or replace function public.my_pending_invitations()
returns table (
  id uuid,
  campaign_id uuid,
  campaign_name text,
  campaign_image_url text,
  invited_by_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id,
    i.campaign_id,
    c.name,
    c.image_url,
    coalesce(p.username, 'Someone'),
    i.created_at
  from public.campaign_invitations i
  join public.campaigns c on c.id = i.campaign_id
  left join public.profiles p on p.id = i.invited_by
  where i.invitee_id = auth.uid()
    and i.status = 'pending'
  order by i.created_at desc;
$$;

create or replace function public.delete_campaign(target_campaign uuid, confirm_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.campaigns;
  actor text;
begin
  select * into target from public.campaigns where id = target_campaign;

  if not found or target.created_by is distinct from auth.uid() then
    raise exception 'Only the person who created a campaign can delete it.';
  end if;

  if trim(confirm_name) is distinct from target.name then
    raise exception 'The campaign name does not match.';
  end if;

  select username into actor from public.profiles where id = auth.uid();

  insert into public.notifications (user_id, type, campaign_name, actor_name)
  select m.user_id, 'campaign_deleted', target.name, coalesce(actor, 'Someone')
  from public.campaign_members m
  where m.campaign_id = target.id
    and m.user_id <> auth.uid();

  delete from public.campaigns where id = target.id;
end;
$$;

create or replace function public.leave_campaign(target_campaign uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.campaigns;
  actor text;
begin
  select * into target from public.campaigns where id = target_campaign;

  if not found or not exists (
    select 1 from public.campaign_members
    where campaign_id = target.id and user_id = auth.uid()
  ) then
    raise exception 'You are not in that campaign.';
  end if;

  if target.created_by is not distinct from auth.uid() then
    raise exception 'The creator cannot leave a campaign. Delete it instead.';
  end if;

  delete from public.campaign_members
  where campaign_id = target.id and user_id = auth.uid();

  select username into actor from public.profiles where id = auth.uid();

  insert into public.notifications (user_id, type, campaign_name, actor_name)
  select m.user_id, 'member_left', target.name, coalesce(actor, 'Someone')
  from public.campaign_members m
  where m.campaign_id = target.id
    and m.role = 'gm';
end;
$$;

-- The two functions above were dropped and recreated, so they lost their
-- grants. The rest keep theirs.
revoke execute on function
  public.find_invitee(uuid, text),
  public.campaign_pending_invitations(uuid)
from public, anon;

grant execute on function
  public.find_invitee(uuid, text),
  public.campaign_pending_invitations(uuid)
to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Existing accounts
-- ---------------------------------------------------------------------------

alter table public.profiles drop constraint profiles_username_format;
drop index public.profiles_username_key;

-- Someone who never picked a username but had a display name keeps it as
-- their username, if it is valid and nobody has it. Ties go to whoever
-- signed up first.
update public.profiles p
set username = c.name
from (
  select distinct on (lower(name)) id, name
  from (
    select id,
           created_at,
           regexp_replace(btrim(display_name), '\s+', ' ', 'g') as name
    from public.profiles
    where username is null and display_name is not null
  ) named
  where name ~ '^[^@[:cntrl:]]{2,50}$'
  order by lower(name), created_at
) c
where p.id = c.id
  and not exists (
    select 1 from public.profiles o where lower(o.username) = lower(c.name)
  );

alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[^@[:cntrl:]]{2,50}$' and username = btrim(username));

create unique index profiles_username_key on public.profiles (lower(username));

-- The app reads the signed-in person's own username from their user metadata,
-- so it is available without a lookup. Bring that in line, and drop the old
-- display name from it.
update auth.users u
set raw_user_meta_data =
  (coalesce(u.raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('username', p.username)) - 'display_name'
from public.profiles p
where p.id = u.id and p.username is not null;

update auth.users
set raw_user_meta_data = raw_user_meta_data - 'display_name'
where raw_user_meta_data ? 'display_name';

alter table public.profiles drop column display_name;
