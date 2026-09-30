-- Campaign images, usernames, invitations to existing users, and invite-link
-- previews. Builds on 20261001000000_campaigns.sql.
--
-- As before, the tables are read-only from the client (or not readable at
-- all); every write goes through a security definer function that checks
-- public.has_campaign_permission(), which is the single place permissions
-- are decided.

-- ---------------------------------------------------------------------------
-- 1. Permissions
-- ---------------------------------------------------------------------------

-- 'manage' covers changing the campaign itself, starting with its image.
insert into public.campaign_role_permissions (role, permission)
values ('gm', 'manage');

-- ---------------------------------------------------------------------------
-- 2. Campaign image
-- ---------------------------------------------------------------------------

alter table public.campaigns
  add column image_url text,
  add column image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-images',
  'campaign-images',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Files live under "<campaign id>/". Returns whether the caller holds the
-- permission on that campaign; false, not an error, for a malformed path.
create function public.has_permission_for_folder(
  object_name text,
  wanted_permission text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  begin
    target := ((storage.foldername(object_name))[1])::uuid;
  exception when others then
    return false;
  end;

  return public.has_campaign_permission(target, wanted_permission);
end;
$$;

create policy "Campaign images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'campaign-images');

create policy "Managers can upload campaign images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'campaign-images'
    and public.has_permission_for_folder(name, 'manage')
  );

create policy "Managers can update campaign images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'campaign-images'
    and public.has_permission_for_folder(name, 'manage')
  );

create policy "Managers can delete campaign images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'campaign-images'
    and public.has_permission_for_folder(name, 'manage')
  );

-- Sets or clears (both null) the campaign image.
create function public.set_campaign_image(
  target_campaign uuid,
  new_url text,
  new_path text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_campaign_permission(target_campaign, 'manage') then
    raise exception 'You are not allowed to change this campaign.';
  end if;

  update public.campaigns
  set image_url = new_url,
      image_path = new_path
  where id = target_campaign;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Usernames and searchable profiles
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column username text,
  add column display_name text,
  add column avatar_url text;

alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$');

create unique index profiles_username_key on public.profiles (username);

-- Profiles are only ever written by the functions and triggers below. The old
-- direct-update policy would let someone put another person's email on their
-- own row, which the invite search would then match.
drop policy "Users can update their own profile" on public.profiles;

-- Accounts created before the profiles migration have no row yet.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- The app keeps a person's display name and photo in their auth user
-- metadata. This copies them (and the email) to profiles so that invitations
-- can show them to other people.
create function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      display_name = nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      avatar_url = nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_from_auth();

update public.profiles p
set display_name = nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    avatar_url = nullif(u.raw_user_meta_data ->> 'avatar_url', '')
from auth.users u
where u.id = p.id;

-- New accounts choose a username at sign-up, passed as user metadata. If it
-- turns out to be invalid or taken, the account is still created without one
-- and the person sets it later in their profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
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

create function public.set_username(new_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text := lower(trim(new_username));
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if cleaned !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Usernames are 3 to 20 characters: letters, numbers and underscores.';
  end if;

  update public.profiles set username = cleaned where id = auth.uid();
exception when unique_violation then
  raise exception 'That username is taken.';
end;
$$;

-- Lets the sign-up form check a username before creating the account.
create function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(trim(candidate)) ~ '^[a-z0-9_]{3,20}$'
    and not exists (
      select 1 from public.profiles where username = lower(trim(candidate))
    );
$$;

-- ---------------------------------------------------------------------------
-- 4. Invitations to existing users
-- ---------------------------------------------------------------------------

create type public.invitation_status
  as enum ('pending', 'accepted', 'declined', 'cancelled');

create table public.campaign_invitations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  invitee_id uuid not null references auth.users (id) on delete cascade,
  invited_by uuid not null references auth.users (id) on delete cascade,
  status public.invitation_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

-- One pending invitation per person per campaign. A declined or cancelled
-- one can be sent again.
create unique index campaign_invitations_one_pending
  on public.campaign_invitations (campaign_id, invitee_id)
  where status = 'pending';

create index campaign_invitations_invitee_idx
  on public.campaign_invitations (invitee_id)
  where status = 'pending';

alter table public.campaign_invitations enable row level security;

create policy "Invitees and people who can invite can read invitations"
  on public.campaign_invitations for select
  using (
    invitee_id = auth.uid()
    or public.has_campaign_permission(campaign_id, 'invite')
  );

-- Exact match only, on the full email or the exact username, so accounts
-- cannot be browsed. Returns just enough to recognise the person.
create function public.find_invitee(target_campaign uuid, search text)
returns table (
  id uuid,
  display_name text,
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
  q text := lower(trim(search));
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
      p.display_name,
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
      and (lower(p.email) = q or p.username = ltrim(q, '@'));
end;
$$;

create function public.invite_user(target_campaign uuid, invitee uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if not public.has_campaign_permission(target_campaign, 'invite') then
    raise exception 'You are not allowed to invite people to this campaign.';
  end if;

  if invitee = auth.uid()
     or not exists (select 1 from public.profiles where id = invitee) then
    raise exception 'That person could not be found.';
  end if;

  if exists (
    select 1 from public.campaign_members
    where campaign_id = target_campaign and user_id = invitee
  ) then
    raise exception 'That person is already in this campaign.';
  end if;

  insert into public.campaign_invitations (campaign_id, invitee_id, invited_by)
  values (target_campaign, invitee, auth.uid())
  returning id into new_id;

  return new_id;
exception when unique_violation then
  raise exception 'That person already has a pending invitation.';
end;
$$;

-- Accepting adds the caller to the campaign as a player.
create function public.respond_to_invitation(invitation uuid, accept boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  update public.campaign_invitations
  set status = (case when accept then 'accepted' else 'declined' end)::public.invitation_status,
      responded_at = now()
  where id = invitation
    and invitee_id = auth.uid()
    and status = 'pending'
  returning campaign_id into target;

  if target is null then
    raise exception 'That invitation is no longer available.';
  end if;

  if accept then
    insert into public.campaign_members (campaign_id, user_id, role)
    values (target, auth.uid(), 'player')
    on conflict (campaign_id, user_id) do nothing;
  end if;

  return target;
end;
$$;

create function public.cancel_invitation(invitation uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  select campaign_id into target
  from public.campaign_invitations
  where id = invitation;

  if target is null
     or not public.has_campaign_permission(target, 'invite') then
    raise exception 'You are not allowed to cancel this invitation.';
  end if;

  update public.campaign_invitations
  set status = 'cancelled', responded_at = now()
  where id = invitation and status = 'pending';
end;
$$;

-- What the invitee sees in Notifications. A function rather than a view
-- because invitees are not members yet, so RLS hides the campaign from them.
create function public.my_pending_invitations()
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
    coalesce(p.display_name, p.username, 'Someone'),
    i.created_at
  from public.campaign_invitations i
  join public.campaigns c on c.id = i.campaign_id
  left join public.profiles p on p.id = i.invited_by
  where i.invitee_id = auth.uid()
    and i.status = 'pending'
  order by i.created_at desc;
$$;

-- What the GM sees under Invitations in Campaign settings.
create function public.campaign_pending_invitations(target_campaign uuid)
returns table (
  id uuid,
  invitee_name text,
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
    select i.id, p.display_name, p.username, i.created_at
    from public.campaign_invitations i
    join public.profiles p on p.id = i.invitee_id
    where i.campaign_id = target_campaign
      and i.status = 'pending'
    order by i.created_at desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Invite links
-- ---------------------------------------------------------------------------

-- Shown on the Accept or Decline screen, including to people who have no
-- account yet, so it is callable without signing in. It reveals only the
-- campaign name and image to whoever holds the link.
create function public.get_invite_preview(invite_code text)
returns table (campaign_name text, campaign_image_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.name, c.image_url
  from public.campaign_invites v
  join public.campaigns c on c.id = v.campaign_id
  where v.code = trim(invite_code);
$$;

-- Same as before, but joining by link also settles any invitation the person
-- already had for this campaign.
create or replace function public.join_campaign(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
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

-- ---------------------------------------------------------------------------
-- 6. Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.has_permission_for_folder(text, text),
  public.set_campaign_image(uuid, text, text),
  public.set_username(text),
  public.username_available(text),
  public.find_invitee(uuid, text),
  public.invite_user(uuid, uuid),
  public.respond_to_invitation(uuid, boolean),
  public.cancel_invitation(uuid),
  public.my_pending_invitations(),
  public.campaign_pending_invitations(uuid),
  public.get_invite_preview(text)
from public, anon;

grant execute on function
  public.has_permission_for_folder(text, text),
  public.set_campaign_image(uuid, text, text),
  public.set_username(text),
  public.find_invitee(uuid, text),
  public.invite_user(uuid, uuid),
  public.respond_to_invitation(uuid, boolean),
  public.cancel_invitation(uuid),
  public.my_pending_invitations(),
  public.campaign_pending_invitations(uuid)
to authenticated;

-- Callable before signing in: the sign-up form and the invite preview.
grant execute on function
  public.username_available(text),
  public.get_invite_preview(text)
to anon, authenticated;

-- Trigger functions run as the trigger, never called directly.
revoke execute on function public.sync_profile_from_auth() from public, anon, authenticated;
