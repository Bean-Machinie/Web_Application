-- Deleting and leaving campaigns, and the notifications that go with them.
-- Builds on 20261002000000_campaign_images_and_invitations.sql.
--
-- Invitations stay in campaign_invitations because they need an answer.
-- Everything else a person should be told about lands in `notifications`,
-- which only needs dismissing. It copies the campaign and person names it
-- shows, so a notification still reads correctly after the campaign is gone.

create type public.notification_type as enum ('campaign_deleted', 'member_left');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.notification_type not null,
  campaign_name text not null,
  actor_name text not null,
  created_at timestamptz not null default now()
);

create index notifications_user_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

-- Dismissing is deleting your own row. Nothing can be inserted or changed
-- from the client; notifications are only created by the functions below.
create policy "Users can dismiss their own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

-- Deleting is for the person who created the campaign, and no one else, so
-- it is not one of the role permissions. The name must be typed out again, as
-- a second check on top of the confirmation in the app. It cannot be undone:
-- members, invite links and invitations go with it.
create function public.delete_campaign(target_campaign uuid, confirm_name text)
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

  select coalesce(display_name, username, 'Someone') into actor
  from public.profiles
  where id = auth.uid();

  insert into public.notifications (user_id, type, campaign_name, actor_name)
  select m.user_id, 'campaign_deleted', target.name, coalesce(actor, 'Someone')
  from public.campaign_members m
  where m.campaign_id = target.id
    and m.user_id <> auth.uid();

  delete from public.campaigns where id = target.id;
end;
$$;

-- Anyone in a campaign can leave it except the person who created it, who can
-- delete it instead. The GMs are told.
create function public.leave_campaign(target_campaign uuid)
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

  select coalesce(display_name, username, 'Someone') into actor
  from public.profiles
  where id = auth.uid();

  insert into public.notifications (user_id, type, campaign_name, actor_name)
  select m.user_id, 'member_left', target.name, coalesce(actor, 'Someone')
  from public.campaign_members m
  where m.campaign_id = target.id
    and m.role = 'gm';
end;
$$;

revoke execute on function
  public.delete_campaign(uuid, text),
  public.leave_campaign(uuid)
from public, anon;

grant execute on function
  public.delete_campaign(uuid, text),
  public.leave_campaign(uuid)
to authenticated;
