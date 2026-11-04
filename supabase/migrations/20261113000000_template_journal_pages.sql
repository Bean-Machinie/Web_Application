-- Campaign templates can include journal pages, and mention each other's entries.
--
-- create_campaign (20261111) takes a third argument, journal_pages: a flat list in
-- parent-first order, each { parent (0-based index into the list, or null), position, title,
-- revealed, content }. The app flattens the template's tree before it sends it.
--
-- A template names its entries with a stable key. Entries and pages mention an entry
-- as a mention node whose attrs.id is "tpl:<key>"; once every entry exists those ids
-- are rewritten to the new entries' ids, in entry fields and in pages alike. A mention
-- of a key that is not in the template becomes plain text (its label). The mention
-- tables are filled by the triggers on world_entry_fields and journal_pages, which run
-- on these inserts. An entry may carry "revealed" (default true).

-- Two overloads would both match a call with two arguments.
drop function public.create_campaign(text, jsonb);

create function public.create_campaign(
  campaign_name text,
  starter_entries jsonb default '[]'::jsonb,
  journal_pages jsonb default '[]'::jsonb
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
  page jsonb;
  entry_fields jsonb;
  new_entry uuid;
  entry_ids uuid[] := '{}';
  page_ids uuid[] := '{}';
  key_map jsonb := '{}'::jsonb;
  position integer := 0;
  entry_no integer;
  page_no integer;
  parent_no integer;
  new_page uuid;
begin
  perform public.deny_guest('create a campaign');
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if jsonb_typeof(starter_entries) is distinct from 'array'
     or jsonb_array_length(starter_entries) > 50 then
    raise exception 'A template can hold at most 50 entries.';
  end if;

  if jsonb_typeof(journal_pages) is distinct from 'array'
     or jsonb_array_length(journal_pages) > 50 then
    raise exception 'A template can hold at most 50 journal pages.';
  end if;

  insert into public.campaigns (name, created_by)
  values (trim(campaign_name), auth.uid())
  returning * into new_campaign;

  insert into public.campaign_members (campaign_id, user_id, role)
  values (new_campaign.id, auth.uid(), 'gm');

  insert into public.campaign_invites (campaign_id)
  values (new_campaign.id);

  -- First every entry, so that the keys are all known before any text points at one.
  for entry in select value from jsonb_array_elements(starter_entries) loop
    if jsonb_typeof(coalesce(entry -> 'fields', '[]'::jsonb)) is distinct from 'array'
       or jsonb_array_length(coalesce(entry -> 'fields', '[]'::jsonb)) > 20 then
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
      coalesce((entry ->> 'revealed')::boolean, true)
    )
    returning id into new_entry;

    position := position + 1;
    entry_ids := entry_ids || new_entry;

    if nullif(entry ->> 'key', '') is not null then
      key_map := key_map || jsonb_build_object('tpl:' || (entry ->> 'key'), to_jsonb(new_entry::text));
    end if;
  end loop;

  -- Then their fields, with the mentions pointing at the new ids.
  for entry, entry_no in
    select e.value, e.n::integer from jsonb_array_elements(starter_entries) with ordinality as e (value, n)
  loop
    entry_fields := coalesce(entry -> 'fields', '[]'::jsonb);

    for field in select value from jsonb_array_elements(entry_fields) loop
      insert into public.world_entry_fields (entry_id, key, type, value, private)
      values (
        entry_ids[entry_no],
        field ->> 'key',
        (field ->> 'type')::public.world_field_type,
        case
          when field ->> 'type' = 'rich_text'
            then public.rewrite_mentions(coalesce(field -> 'value', 'null'::jsonb), key_map, false)
          else coalesce(field -> 'value', 'null'::jsonb)
        end,
        coalesce((field ->> 'private')::boolean, false)
      );
    end loop;
  end loop;

  -- The pages, parents first, so a page's parent is always made before it.
  for page, page_no in
    select p.value, p.n::integer from jsonb_array_elements(journal_pages) with ordinality as p (value, n)
  loop
    if char_length(trim(coalesce(page ->> 'title', ''))) not between 1 and 120 then
      raise exception 'Every journal page needs a title of at most 120 characters.';
    end if;

    -- Arrays count from 1, the app's list from 0.
    parent_no := (page ->> 'parent')::integer + 1;
    if parent_no is not null and (parent_no < 1 or parent_no >= page_no) then
      raise exception 'A journal page must come after its parent.';
    end if;

    insert into public.journal_pages (campaign_id, parent_id, position, title, content, revealed, created_by)
    values (
      new_campaign.id,
      page_ids[parent_no],
      coalesce((page ->> 'position')::integer, 0),
      trim(page ->> 'title'),
      public.rewrite_mentions(coalesce(page -> 'content', 'null'::jsonb), key_map, false),
      coalesce((page ->> 'revealed')::boolean, false),
      auth.uid()
    )
    returning id into new_page;

    page_ids := page_ids || new_page;
  end loop;

  return new_campaign;
end;
$$;

revoke execute on function public.create_campaign(text, jsonb, jsonb) from public, anon;
grant execute on function public.create_campaign(text, jsonb, jsonb) to authenticated;
