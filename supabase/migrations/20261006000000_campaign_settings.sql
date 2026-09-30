-- Campaign settings: description, status, the member list, removing members
-- and transferring ownership. Builds on 20261005000000.

create type public.campaign_status as enum ('active', 'paused', 'finished');

alter table public.campaigns
  add column description text not null default ''
    check (char_length(description) <= 300),
  add column status public.campaign_status not null default 'active';

-- Removing someone is a role permission, so a future co-GM role can be given
-- it with one more row here and one in campaign-permissions.ts.
insert into public.campaign_role_permissions (role, permission)
values ('gm', 'remove_members');

-- Profiles can only be read by their owner, so this is the one way to see who
-- else is in a campaign you belong to.
create function public.campaign_members_list(target_campaign uuid)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  role public.campaign_role,
  joined_at timestamptz,
  is_creator boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_campaign_member(target_campaign) then
    raise exception 'You are not in that campaign.';
  end if;

  return query
    select m.user_id, p.username, p.avatar_url, m.role, m.joined_at,
           m.user_id = c.created_by
    from public.campaign_members m
    join public.campaigns c on c.id = m.campaign_id
    left join public.profiles p on p.id = m.user_id
    where m.campaign_id = target_campaign
    order by m.joined_at;
end;
$$;

create function public.update_campaign_details(
  target_campaign uuid,
  new_name text,
  new_description text
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
  set name = trim(new_name),
      description = trim(new_description)
  where id = target_campaign;
end;
$$;

create function public.set_campaign_status(
  target_campaign uuid,
  new_status public.campaign_status
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
  set status = new_status
  where id = target_campaign;
end;
$$;

-- The creator cannot be removed, and only the creator can remove another GM.
create function public.remove_campaign_member(
  target_campaign uuid,
  target_user uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.campaigns;
  member public.campaign_members;
  actor text;
begin
  if not public.has_campaign_permission(target_campaign, 'remove_members') then
    raise exception 'You are not allowed to remove people from this campaign.';
  end if;

  select * into target from public.campaigns where id = target_campaign;
  select * into member from public.campaign_members
  where campaign_id = target_campaign and user_id = target_user;

  if not found then
    raise exception 'That person is not in this campaign.';
  end if;

  if target_user = auth.uid() then
    raise exception 'You cannot remove yourself. Leave the campaign instead.';
  end if;

  if target_user = target.created_by then
    raise exception 'The person who created a campaign cannot be removed.';
  end if;

  if member.role = 'gm' and target.created_by is distinct from auth.uid() then
    raise exception 'Only the person who created a campaign can remove a GM.';
  end if;

  delete from public.campaign_members
  where campaign_id = target_campaign and user_id = target_user;

  select username into actor from public.profiles where id = auth.uid();

  insert into public.notifications (user_id, type, campaign_name, actor_name)
  values (target_user, 'removed_from_campaign', target.name,
          coalesce(actor, 'Someone'));
end;
$$;

-- Only the creator can hand a campaign over, like deleting it. The new owner
-- becomes a GM if they are not one, and the old owner stays a GM.
create function public.transfer_campaign_ownership(
  target_campaign uuid,
  new_owner uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.campaigns;
  old_name text;
  new_name text;
begin
  select * into target from public.campaigns where id = target_campaign;

  if not found or target.created_by is distinct from auth.uid() then
    raise exception 'Only the person who created a campaign can transfer it.';
  end if;

  if new_owner = auth.uid() then
    raise exception 'You already own this campaign.';
  end if;

  if not exists (
    select 1 from public.campaign_members
    where campaign_id = target_campaign and user_id = new_owner
  ) then
    raise exception 'That person is not in this campaign.';
  end if;

  update public.campaign_members
  set role = 'gm'
  where campaign_id = target_campaign and user_id = new_owner;

  update public.campaigns
  set created_by = new_owner
  where id = target_campaign;

  select username into old_name from public.profiles where id = auth.uid();
  select username into new_name from public.profiles where id = new_owner;

  insert into public.notifications (user_id, type, campaign_name, actor_name)
  values
    (new_owner, 'ownership_received', target.name, coalesce(old_name, 'Someone')),
    (auth.uid(), 'ownership_given', target.name, coalesce(new_name, 'Someone'));
end;
$$;

revoke execute on function
  public.campaign_members_list(uuid),
  public.update_campaign_details(uuid, text, text),
  public.set_campaign_status(uuid, public.campaign_status),
  public.remove_campaign_member(uuid, uuid),
  public.transfer_campaign_ownership(uuid, uuid)
from public, anon;

grant execute on function
  public.campaign_members_list(uuid),
  public.update_campaign_details(uuid, text, text),
  public.set_campaign_status(uuid, public.campaign_status),
  public.remove_campaign_member(uuid, uuid),
  public.transfer_campaign_ownership(uuid, uuid)
to authenticated;
