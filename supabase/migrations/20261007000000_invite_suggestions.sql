-- People worth suggesting when inviting to a campaign: those you share
-- another campaign with, and those you have invited before. Nobody who is
-- already in this campaign or already has a pending invitation to it.
-- Only people the caller already has a connection to come back, so this
-- cannot be used to browse accounts; strangers still need the exact-match
-- lookup in find_invitee.

create function public.invite_suggestions(target_campaign uuid)
returns table (
  id uuid,
  username text,
  avatar_url text,
  reason text,
  context_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_campaign_permission(target_campaign, 'invite') then
    raise exception 'You are not allowed to invite people to this campaign.';
  end if;

  return query
    with candidates as (
      select m.user_id as person,
             'shared_campaign' as why,
             c.name as context,
             m.joined_at as at
      from public.campaign_members mine
      join public.campaign_members m on m.campaign_id = mine.campaign_id
      join public.campaigns c on c.id = mine.campaign_id
      where mine.user_id = auth.uid()
        and mine.campaign_id <> target_campaign

      union all

      select i.invitee_id, 'invited_before', null, i.created_at
      from public.campaign_invitations i
      where i.invited_by = auth.uid()
    ),
    ranked as (
      select distinct on (person) person, why, context, at
      from candidates
      where person <> auth.uid()
        and not exists (
          select 1 from public.campaign_members t
          where t.campaign_id = target_campaign and t.user_id = person
        )
        and not exists (
          select 1 from public.campaign_invitations p
          where p.campaign_id = target_campaign
            and p.invitee_id = person
            and p.status = 'pending'
        )
      order by person, (why = 'shared_campaign') desc, at desc
    )
    select r.person, p.username, p.avatar_url, r.why, r.context
    from ranked r
    join public.profiles p on p.id = r.person
    where p.username is not null
    order by r.at desc
    limit 8;
end;
$$;

revoke execute on function public.invite_suggestions(uuid) from public, anon;
grant execute on function public.invite_suggestions(uuid) to authenticated;
