-- Campaigns, who belongs to them, and invite links.
--
-- Every change to campaigns, members and invites goes through the security
-- definer functions at the bottom, so the tables themselves are read-only
-- from the client. Which role may do what is decided in ONE place:
-- public.campaign_role_permissions, checked by public.has_campaign_permission().
-- To let another role (say a co-GM) invite people later, add a row there.

create type public.campaign_role as enum ('gm', 'player');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.campaign_members (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.campaign_role not null default 'player',
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

create index campaign_members_user_id_idx on public.campaign_members (user_id);

-- Kept apart from campaigns so players, who can read their campaigns, cannot
-- read the invite code. Invite links do not expire; a GM resets them.
create table public.campaign_invites (
  campaign_id uuid primary key references public.campaigns (id) on delete cascade,
  code text not null unique default replace(gen_random_uuid()::text, '-', '')
);

create table public.campaign_role_permissions (
  role public.campaign_role not null,
  permission text not null,
  primary key (role, permission)
);

insert into public.campaign_role_permissions (role, permission)
values ('gm', 'invite');

-- Permission checks. Security definer so they can read the tables above
-- without tripping the row-level security policies that call them.
create function public.is_campaign_member(target_campaign uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members
    where campaign_id = target_campaign
      and user_id = auth.uid()
  );
$$;

create function public.has_campaign_permission(
  target_campaign uuid,
  wanted_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members m
    join public.campaign_role_permissions p on p.role = m.role
    where m.campaign_id = target_campaign
      and m.user_id = auth.uid()
      and p.permission = wanted_permission
  );
$$;

-- Row-level security. There are no insert, update or delete policies on
-- purpose: writes only happen through the functions below.
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.campaign_invites enable row level security;
alter table public.campaign_role_permissions enable row level security;

create policy "Members can read their campaigns"
  on public.campaigns for select
  using (public.is_campaign_member(id));

create policy "Members can read who is in their campaigns"
  on public.campaign_members for select
  using (public.is_campaign_member(campaign_id));

create policy "Only people who can invite can read the invite code"
  on public.campaign_invites for select
  using (public.has_campaign_permission(campaign_id, 'invite'));

-- Creates a campaign and makes the caller its GM.
create function public.create_campaign(campaign_name text)
returns public.campaigns
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_campaign public.campaigns;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  insert into public.campaigns (name, created_by)
  values (trim(campaign_name), auth.uid())
  returning * into new_campaign;

  insert into public.campaign_members (campaign_id, user_id, role)
  values (new_campaign.id, auth.uid(), 'gm');

  insert into public.campaign_invites (campaign_id)
  values (new_campaign.id);

  return new_campaign;
end;
$$;

-- Joins the campaign the invite code belongs to, as a player.
create function public.join_campaign(invite_code text)
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

  return target;
end;
$$;

-- Replaces the invite code, so the old link stops working.
create function public.reset_campaign_invite(target_campaign uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_code text := replace(gen_random_uuid()::text, '-', '');
begin
  if not public.has_campaign_permission(target_campaign, 'invite') then
    raise exception 'You are not allowed to reset this invite link.';
  end if;

  update public.campaign_invites
  set code = new_code
  where campaign_id = target_campaign;

  return new_code;
end;
$$;

-- Functions are callable by anyone by default; limit them to signed-in users.
revoke execute on function
  public.is_campaign_member(uuid),
  public.has_campaign_permission(uuid, text),
  public.create_campaign(text),
  public.join_campaign(text),
  public.reset_campaign_invite(uuid)
from public, anon;

grant execute on function
  public.is_campaign_member(uuid),
  public.has_campaign_permission(uuid, text),
  public.create_campaign(text),
  public.join_campaign(text),
  public.reset_campaign_invite(uuid)
to authenticated;
