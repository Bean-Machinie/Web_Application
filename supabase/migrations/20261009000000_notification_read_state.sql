-- One notification system for everything: read state, paging, and
-- invitations as a notification type. Builds on 20261008000000.
--
-- Read state is generic. Any future type gets it for free: a row is unread
-- until read_at is set, and the only way to set it is mark_notifications_read.

alter table public.notifications
  add column read_at timestamptz,
  add column campaign_id uuid,
  add column invitation_id uuid
    references public.campaign_invitations (id) on delete cascade;

-- campaign_id has no foreign key on purpose: a notice about a deleted
-- campaign must still read correctly.

create index notifications_unread_idx
  on public.notifications (user_id)
  where read_at is null;

drop index public.notifications_user_idx;
create index notifications_user_page_idx
  on public.notifications (user_id, created_at desc, id desc);

-- ---------------------------------------------------------------------------
-- Paging and read state
-- ---------------------------------------------------------------------------

-- One page, newest first. Pass the last row of the previous page as the
-- cursor to get the next one. A function rather than a table read because it
-- joins the invitation's current status and the campaign image, which an
-- invitee cannot read directly.
create function public.my_notifications(
  page_size int,
  before_created_at timestamptz default null,
  before_id uuid default null
)
returns table (
  id uuid,
  type public.notification_type,
  campaign_id uuid,
  campaign_name text,
  campaign_image_url text,
  actor_name text,
  invitation_id uuid,
  invitation_status public.invitation_status,
  read_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select n.id, n.type, n.campaign_id, n.campaign_name, c.image_url,
         n.actor_name, n.invitation_id, i.status, n.read_at, n.created_at
  from public.notifications n
  left join public.campaigns c on c.id = n.campaign_id
  left join public.campaign_invitations i on i.id = n.invitation_id
  where n.user_id = auth.uid()
    and (
      before_created_at is null
      or (n.created_at, n.id) < (before_created_at, before_id)
    )
  order by n.created_at desc, n.id desc
  limit least(greatest(page_size, 1), 50);
$$;

create function public.mark_notifications_read(ids uuid[])
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and id = any (ids)
    and read_at is null;
$$;

-- ---------------------------------------------------------------------------
-- Invitations create, update and remove their notification
-- ---------------------------------------------------------------------------

create or replace function public.invite_user(target_campaign uuid, invitee uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  campaign public.campaigns;
  actor text;
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

  select * into campaign from public.campaigns where id = target_campaign;
  select username into actor from public.profiles where id = auth.uid();

  insert into public.notifications
    (user_id, type, campaign_id, campaign_name, actor_name, invitation_id)
  values
    (invitee, 'campaign_invitation', target_campaign, campaign.name,
     coalesce(actor, 'Someone'), new_id);

  return new_id;
exception when unique_violation then
  raise exception 'That person already has a pending invitation.';
end;
$$;

-- Answering also counts as reading. The notification stays, and its text
-- follows the invitation's status.
create or replace function public.respond_to_invitation(invitation uuid, accept boolean)
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

  update public.notifications
  set read_at = coalesce(read_at, now())
  where invitation_id = invitation and user_id = auth.uid();

  return target;
end;
$$;

-- A cancelled invitation has nothing left to answer, so its notification goes.
create or replace function public.cancel_invitation(invitation uuid)
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

  if found then
    delete from public.notifications where invitation_id = invitation;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Existing data
-- ---------------------------------------------------------------------------

-- Invitations already waiting get their notification, unread. Existing
-- notices stay unread too, since nobody may have seen them yet.
insert into public.notifications
  (user_id, type, campaign_id, campaign_name, actor_name, invitation_id, created_at)
select i.invitee_id, 'campaign_invitation', i.campaign_id, c.name,
       coalesce(p.username, 'Someone'), i.id, i.created_at
from public.campaign_invitations i
join public.campaigns c on c.id = i.campaign_id
left join public.profiles p on p.id = i.invited_by
where i.status = 'pending';

-- The notification list replaces it.
drop function public.my_pending_invitations();

revoke execute on function
  public.my_notifications(int, timestamptz, uuid),
  public.mark_notifications_read(uuid[])
from public, anon;

grant execute on function
  public.my_notifications(int, timestamptz, uuid),
  public.mark_notifications_read(uuid[])
to authenticated;
