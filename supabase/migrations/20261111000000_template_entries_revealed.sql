-- Entries from a campaign template start revealed, so players see them at once.
-- This is create_campaign from 20261109 with revealed set on the insert.

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

    insert into public.world_entries (kind, name, campaign_id, created_by, sort_order, revealed)
    values (
      (entry ->> 'kind')::public.world_entry_kind,
      trim(entry ->> 'name'),
      new_campaign.id,
      auth.uid(),
      position,
      true
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
