-- Typo-tolerant search of entry names for the command palette, across every
-- campaign the caller belongs to and the caller's own library.
--
-- It runs as the caller (security invoker), so the "Read world entries" policy
-- decides what is found: a GM finds every entry in their campaigns, anyone
-- else only revealed ones, and a library entry only its owner. Only names are
-- matched; the fields table is never read, so private fields cannot match.

create extension if not exists pg_trgm with schema extensions;

-- Serves both the substring test (LIKE '%x%') and the fuzzy test (<%).
create index if not exists world_entries_name_trgm_idx
  on public.world_entries using gin (lower(name) extensions.gin_trgm_ops);

create function public.search_world_entries(
  search_text text,
  current_campaign uuid default null,
  per_group integer default 8,
  sources text[] default array['current', 'other', 'library']
)
returns table (
  id uuid,
  -- Null for a library entry.
  campaign_id uuid,
  campaign_name text,
  kind public.world_entry_kind,
  name text,
  -- 'current' (in current_campaign), 'other' (in another of the caller's
  -- campaigns) or 'library'.
  source text,
  similarity real
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  term text := lower(trim(search_text));
  pattern text;
begin
  -- One letter matches nearly everything, so it matches nothing.
  if char_length(term) < 2 then
    return;
  end if;

  -- The search as a LIKE pattern, with its own wildcards made literal.
  pattern := '%' || replace(replace(replace(term, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  -- Lets "kestral" find "Kestrel" (about 0.45) without matching unrelated names.
  perform set_config('pg_trgm.word_similarity_threshold', '0.3', true);

  return query
  with hits as (
    select e.id, e.campaign_id, c.name as campaign_name, e.kind, e.name,
           case
             when e.owner_id is not null then 'library'
             when e.campaign_id = current_campaign then 'current'
             else 'other'
           end as source,
           extensions.word_similarity(term, lower(e.name)) as sim,
           lower(e.name) = term as is_exact,
           starts_with(lower(e.name), term) as starts
    from public.world_entries e
    left join public.campaigns c on c.id = e.campaign_id
    where lower(e.name) like pattern
       or (char_length(term) >= 3 and term operator(extensions.<%) lower(e.name))
  ),
  ranked as (
    select h.*,
           row_number() over (
             partition by h.source
             order by h.is_exact desc, h.starts desc, h.sim desc, length(h.name), h.name
           ) as position
    from hits h
    where h.source = any (sources)
  )
  select r.id, r.campaign_id, r.campaign_name, r.kind, r.name, r.source, r.sim
  from ranked r
  where r.position <= least(greatest(per_group, 1), 20)
  order by r.source, r.position;
end;
$$;

revoke execute on function public.search_world_entries(text, uuid, integer, text[]) from public, anon;
grant execute on function public.search_world_entries(text, uuid, integer, text[]) to authenticated;
