-- Library tests: policies and functions checked as a campaign GM, a player,
-- a library owner and a stranger.
--
-- HOW TO RUN: apply the three library migrations first, then paste this whole
-- file into the Supabase SQL editor and run it once, on a development project.
-- It runs inside one transaction that is rolled back at the end, so nothing is
-- kept. The last statement returns one row per check (failures first) after a
-- summary row. If the editor stops with an error instead, nothing was kept
-- either; the error names the statement.
--
-- Inside a statement, {name} stands for the id of that name in
-- pg_temp.test_ids (see the fixtures).

begin;

select set_config('test.log', '', false);

create temp table test_ids (name text primary key, id uuid not null);

create function pg_temp.id(who text) returns uuid
language sql as $$ select id from pg_temp.test_ids where name = who $$;

create function pg_temp.fill(stmt text) returns text
language plpgsql as $$
declare r record;
begin
  for r in select name, id from pg_temp.test_ids loop
    stmt := replace(stmt, '{' || r.name || '}', r.id::text);
  end loop;
  return stmt;
end $$;

-- null = signed out, the 'root' id = the postgres role, anything else = that user.
create function pg_temp.act_as(who uuid) returns void
language plpgsql as $$
begin
  reset role;
  if who is null then
    perform set_config('request.jwt.claims', '', true);
    set local role anon;
  elsif who <> pg_temp.id('root') then
    perform set_config(
      'request.jwt.claims',
      json_build_object('sub', who, 'role', 'authenticated')::text, true
    );
    set local role authenticated;
  end if;
end $$;

create function pg_temp.report(label text, ok boolean, detail text default null)
returns void language plpgsql as $$
begin
  -- Session-wide (not local) so the log survives the rollback.
  perform set_config(
    'test.log',
    current_setting('test.log', true)
      || case when ok then 'PASS' else 'FAIL' end || '|' || label
      || case when ok or detail is null then ''
              else '  [' || replace(detail, chr(10), ' ') || ']' end
      || chr(10),
    false
  );
end $$;

-- The statement must succeed.
create function pg_temp.allowed(who uuid, label text, stmt text) returns void
language plpgsql as $$
declare problem text;
begin
  stmt := pg_temp.fill(stmt);
  perform pg_temp.act_as(who);
  begin
    execute stmt;
  exception when others then
    problem := sqlerrm;
  end;
  reset role;
  perform pg_temp.report(label, problem is null, problem);
end $$;

-- The statement must fail, and the error must contain the fragment, so a typo
-- in a test cannot pass for a refusal.
create function pg_temp.denied(who uuid, label text, fragment text, stmt text)
returns void language plpgsql as $$
declare problem text := 'no error';
begin
  stmt := pg_temp.fill(stmt);
  perform pg_temp.act_as(who);
  begin
    execute stmt;
  exception when others then
    problem := case when sqlerrm ilike '%' || fragment || '%' then null
                    else 'wrong error: ' || sqlerrm end;
  end;
  reset role;
  perform pg_temp.report(label, problem is null, problem);
end $$;

-- Either an error or zero rows changed: for direct writes that RLS blocks.
create function pg_temp.no_effect(who uuid, label text, stmt text) returns void
language plpgsql as $$
declare changed integer := 0;
begin
  stmt := pg_temp.fill(stmt);
  perform pg_temp.act_as(who);
  begin
    execute stmt;
    get diagnostics changed = row_count;
  exception when others then
    changed := 0;
  end;
  reset role;
  perform pg_temp.report(label, changed = 0, changed || ' rows changed');
end $$;

create function pg_temp.count_is(who uuid, label text, q text, expected integer)
returns void language plpgsql as $$
declare n integer; problem text;
begin
  q := pg_temp.fill(q);
  perform pg_temp.act_as(who);
  begin
    execute 'select count(*) from (' || q || ') q' into n;
  exception when others then
    problem := sqlerrm;
  end;
  reset role;
  perform pg_temp.report(label, problem is null and n = expected,
    coalesce(problem, 'got ' || n || ', wanted ' || expected));
end $$;

create function pg_temp.value_is(who uuid, label text, q text, expected text)
returns void language plpgsql as $$
declare v text; problem text;
begin
  q := pg_temp.fill(q);
  perform pg_temp.act_as(who);
  begin
    execute q into v;
  exception when others then
    problem := sqlerrm;
  end;
  reset role;
  perform pg_temp.report(label, problem is null and v is not distinct from pg_temp.fill(expected),
    coalesce(problem, 'got ' || coalesce(v, 'null') || ', wanted ' || coalesce(expected, 'null')));
end $$;

-- A read checked for all four people: the count each should see.
create function pg_temp.sees(label text, q text, gm int, player int, owner int, stranger int)
returns void language plpgsql as $$
begin
  perform pg_temp.count_is(pg_temp.id('gm'), label || ' / GM', q, gm);
  perform pg_temp.count_is(pg_temp.id('player'), label || ' / player', q, player);
  perform pg_temp.count_is(pg_temp.id('owner'), label || ' / owner', q, owner);
  perform pg_temp.count_is(pg_temp.id('stranger'), label || ' / stranger', q, stranger);
end $$;

-- A write checked for all four people. Refusals run first, so a success
-- cannot change what the others are refused on.
create function pg_temp.may(
  label text, stmt text, gm boolean, player boolean, owner boolean, stranger boolean,
  fragment text default 'not allowed'
) returns void language plpgsql as $$
declare
  names text[] := array['gm', 'player', 'owner', 'stranger'];
  flags boolean[] := array[gm, player, owner, stranger];
  pass boolean;
  i integer;
begin
  foreach pass in array array[false, true] loop
    for i in 1 .. 4 loop
      if flags[i] = pass then
        if pass then
          perform pg_temp.allowed(pg_temp.id(names[i]), label || ' / ' || names[i], stmt);
        else
          perform pg_temp.denied(pg_temp.id(names[i]), label || ' / ' || names[i], fragment, stmt);
        end if;
      end if;
    end loop;
  end loop;
end $$;

-- A write that must change exactly this many rows (without raising).
create function pg_temp.changes(who uuid, label text, stmt text, expected integer)
returns void language plpgsql as $$
declare changed integer := -1; problem text;
begin
  stmt := pg_temp.fill(stmt);
  perform pg_temp.act_as(who);
  begin
    execute stmt;
    get diagnostics changed = row_count;
  exception when others then
    problem := sqlerrm;
  end;
  reset role;
  perform pg_temp.report(label, problem is null and changed = expected,
    coalesce(problem, changed || ' rows changed, wanted ' || expected));
end $$;

-- Four people, two campaigns and the entries the tests read and copy.
--   gm       GM of campaign c1
--   player   player in c1
--   owner    owns library entries, belongs to no campaign
--   stranger GM of campaign c2 only
-- Campaign entries: ec (revealed), ech (hidden), ect (revealed, template
-- portrait), dc (hidden, for deleting), emap (map), ebad and emulti (images
-- that cannot be copied). Library entries: el, dl (owner), elg (gm).

insert into pg_temp.test_ids values
  ('root',     '00000000-0000-0000-0000-000000000000'),
  ('gm',       'a0000000-0000-0000-0000-000000000001'),
  ('player',   'a0000000-0000-0000-0000-000000000002'),
  ('owner',    'a0000000-0000-0000-0000-000000000003'),
  ('stranger', 'a0000000-0000-0000-0000-000000000004'),
  ('c1',       'c0000000-0000-0000-0000-000000000001'),
  ('c2',       'c0000000-0000-0000-0000-000000000002'),
  ('ec',       'e0000000-0000-0000-0000-000000000001'),
  ('ech',      'e0000000-0000-0000-0000-000000000002'),
  ('el',       'e0000000-0000-0000-0000-000000000003'),
  ('elg',      'e0000000-0000-0000-0000-000000000004'),
  ('emap',     'e0000000-0000-0000-0000-000000000005'),
  ('ed',       'e0000000-0000-0000-0000-000000000006'),
  ('ect',      'e0000000-0000-0000-0000-000000000007'),
  ('ebad',     'e0000000-0000-0000-0000-000000000008'),
  ('emulti',   'e0000000-0000-0000-0000-000000000009'),
  ('dc',       'e0000000-0000-0000-0000-00000000000a'),
  ('dl',       'e0000000-0000-0000-0000-00000000000b'),
  ('n1', 'f0000000-0000-0000-0000-000000000001'),
  ('n2', 'f0000000-0000-0000-0000-000000000002'),
  ('n3', 'f0000000-0000-0000-0000-000000000003'),
  ('n4', 'f0000000-0000-0000-0000-000000000004'),
  ('n5', 'f0000000-0000-0000-0000-000000000005'),
  ('n6', 'f0000000-0000-0000-0000-000000000006'),
  ('n7', 'f0000000-0000-0000-0000-000000000007'),
  ('n8', 'f0000000-0000-0000-0000-000000000008'),
  ('n9', 'f0000000-0000-0000-0000-000000000009'),
  ('x1', 'f1000000-0000-0000-0000-000000000001'),
  ('x2', 'f1000000-0000-0000-0000-000000000002');

insert into auth.users (id, email)
select id, name || '@test.local'
from pg_temp.test_ids
where name in ('gm', 'player', 'owner', 'stranger');

insert into public.campaigns (id, name, created_by) values
  (pg_temp.id('c1'), 'Test C', pg_temp.id('gm')),
  (pg_temp.id('c2'), 'Test D', pg_temp.id('stranger'));

insert into public.campaign_members (campaign_id, user_id, role) values
  (pg_temp.id('c1'), pg_temp.id('gm'), 'gm'),
  (pg_temp.id('c1'), pg_temp.id('player'), 'player'),
  (pg_temp.id('c2'), pg_temp.id('stranger'), 'gm');

insert into public.world_entries (id, kind, name, campaign_id, owner_id, revealed, sort_order)
select pg_temp.id(e.k), e.kind::public.world_entry_kind, e.k,
  case when e.lib is null then pg_temp.id(e.camp) end,
  case when e.lib is not null then pg_temp.id(e.lib) end,
  e.revealed, e.pos
from (values
  ('ec',     'character', 'c1', null,    true,  1),
  ('ech',    'character', 'c1', null,    false, 2),
  ('ect',    'character', 'c1', null,    true,  3),
  ('dc',     'location',  'c1', null,    false, 4),
  ('emap',   'map',       'c1', null,    false, 5),
  ('ebad',   'item',      'c1', null,    false, 6),
  ('emulti', 'item',      'c1', null,    false, 7),
  ('ed',     'character', 'c2', null,    false, 1),
  ('el',     'character', null, 'owner', false, 1),
  ('dl',     'character', null, 'owner', false, 2),
  ('elg',    'character', null, 'gm',    false, 7)
) as e (k, kind, camp, lib, revealed, pos);

-- A public field, a private one with content, a private empty one, a stat
-- block that has taken damage, and an image stored in the entry's own folder.
create function pg_temp.seed_fields(entry text, folder uuid) returns void
language plpgsql as $$
declare
  stored text := folder || '/' || pg_temp.id(entry) || '/1.webp';
begin
  insert into public.world_entry_fields (entry_id, key, type, value, private) values
    (pg_temp.id(entry), 'role', 'short_text', '"Innkeeper"', false),
    (pg_temp.id(entry), 'secret', 'rich_text', '"Hidden truth"', true),
    (pg_temp.id(entry), 'empty_secret', 'rich_text', '""', true),
    (pg_temp.id(entry), 'stat_block', 'stat_block',
      '{"v":1,"health":10,"healthCurrent":3,"defense":2}', false),
    (pg_temp.id(entry), 'image', 'image', jsonb_build_object(
      'url', 'https://x.supabase.co/storage/v1/object/public/world-images/' || stored,
      'path', stored, 'width', 100), false);
end $$;

select pg_temp.seed_fields('ec', pg_temp.id('c1'));
select pg_temp.seed_fields('el', pg_temp.id('owner'));
select pg_temp.seed_fields('elg', pg_temp.id('gm'));

insert into public.world_entry_fields (entry_id, key, type, value, private) values
  (pg_temp.id('ech'), 'role', 'short_text', '"Spy"', false),
  (pg_temp.id('ech'), 'secret', 'rich_text', '"Double agent"', true),
  (pg_temp.id('ect'), 'image', 'image', '{"url":"/portraits/bram.webp"}', false),
  (pg_temp.id('ebad'), 'image', 'image',
    '{"url":"https://x.supabase.co/y.webp","path":"p.webp"}', false),
  (pg_temp.id('emulti'), 'image', 'image', jsonb_build_object(
    'url', 'https://x.supabase.co/storage/v1/object/public/world-images/a/b/1.webp',
    'path', 'a/b/1.webp'), false),
  (pg_temp.id('emulti'), 'extra', 'image', jsonb_build_object(
    'url', 'https://x.supabase.co/storage/v1/object/public/world-images/a/b/2.webp',
    'path', 'a/b/2.webp'), false);

-- Files the copies will point at, as if the app had already copied them.
insert into storage.objects (bucket_id, name)
select 'world-images', pg_temp.fill(p)
from unnest(array[
  '{gm}/{n1}/1.webp',      -- ec into the gm's library
  '{c1}/{n5}/1.webp',      -- elg into c1
  '{gm}/{n6}/1.webp',      -- ebad
  '{gm}/{n7}/1.webp',      -- emulti
  '{c2}/{n9}/1.webp',      -- another campaign's folder
  '{owner}/{n9}/1.webp',   -- another person's folder
  '{gm}/{n8}/1.webp'       -- another entry's folder
]) as p;

-- Reading: rows, fields, and the rule for who counts as the manager of an entry.
-- Columns of every table below: GM, player, owner, stranger.

select pg_temp.sees('revealed campaign entry', $$select 1 from public.world_entries where id = '{ec}'$$, 1, 1, 0, 0);
select pg_temp.sees('hidden campaign entry',   $$select 1 from public.world_entries where id = '{ech}'$$, 1, 0, 0, 0);
select pg_temp.sees('library entry',           $$select 1 from public.world_entries where id = '{el}'$$, 0, 0, 1, 0);
select pg_temp.sees('campaign list',           $$select 1 from public.world_entries where campaign_id = '{c1}'$$, 7, 2, 0, 0);
select pg_temp.sees('library list',            $$select 1 from public.world_entries where owner_id is not null$$, 1, 0, 2, 0);

-- Fields straight from the table: private rows never reach a player.
select pg_temp.sees('table: public field of revealed entry',  $$select 1 from public.world_entry_fields where entry_id = '{ec}' and key = 'role'$$, 1, 1, 0, 0);
select pg_temp.sees('table: private field of revealed entry', $$select 1 from public.world_entry_fields where entry_id = '{ec}' and key = 'secret'$$, 1, 0, 0, 0);
select pg_temp.sees('table: public field of hidden entry',    $$select 1 from public.world_entry_fields where entry_id = '{ech}' and key = 'role'$$, 1, 0, 0, 0);
select pg_temp.sees('table: private field of library entry',  $$select 1 from public.world_entry_fields where entry_id = '{el}' and key = 'secret'$$, 0, 0, 1, 0);
select pg_temp.sees('table: public field of library entry',   $$select 1 from public.world_entry_fields where entry_id = '{el}' and key = 'role'$$, 0, 0, 1, 0);

-- Fields through the function the app uses.
select pg_temp.sees('fn: public field of revealed entry',          $$select 1 from public.get_world_entry_fields('{ec}') where key = 'role'$$, 1, 1, 0, 0);
select pg_temp.sees('fn: private field exists for a player',       $$select 1 from public.get_world_entry_fields('{ec}') where key = 'secret'$$, 1, 1, 0, 0);
select pg_temp.sees('fn: private field value is sent',             $$select 1 from public.get_world_entry_fields('{ec}') where key = 'secret' and value is not null$$, 1, 0, 0, 0);
select pg_temp.sees('fn: empty private field is left out',         $$select 1 from public.get_world_entry_fields('{ec}') where key = 'empty_secret'$$, 1, 0, 0, 0);
select pg_temp.sees('fn: fields of a hidden entry',                $$select 1 from public.get_world_entry_fields('{ech}')$$, 2, 0, 0, 0);
select pg_temp.sees('fn: public field of library entry',           $$select 1 from public.get_world_entry_fields('{el}') where key = 'role'$$, 0, 0, 1, 0);
select pg_temp.sees('fn: private value of library entry',          $$select 1 from public.get_world_entry_fields('{el}') where key = 'secret' and value is not null$$, 0, 0, 1, 0);
select pg_temp.sees('fn: unknown entry',                           $$select 1 from public.get_world_entry_fields('{n9}')$$, 0, 0, 0, 0);

-- The manager rule itself.
select pg_temp.value_is(pg_temp.id('gm'),       'can_manage_entry: GM, campaign entry',     $$select public.can_manage_entry('{ec}')::text$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'),       'can_manage_entry: GM, library entry of owner', $$select public.can_manage_entry('{el}')::text$$, 'false');
select pg_temp.value_is(pg_temp.id('gm'),       'can_manage_entry: GM, own library entry',  $$select public.can_manage_entry('{elg}')::text$$, 'true');
select pg_temp.value_is(pg_temp.id('player'),   'can_manage_entry: player, campaign entry', $$select public.can_manage_entry('{ec}')::text$$, 'false');
select pg_temp.value_is(pg_temp.id('owner'),    'can_manage_entry: owner, own entry',       $$select public.can_manage_entry('{el}')::text$$, 'true');
select pg_temp.value_is(pg_temp.id('owner'),    'can_manage_entry: owner, campaign entry',  $$select public.can_manage_entry('{ec}')::text$$, 'false');
select pg_temp.value_is(pg_temp.id('stranger'), 'can_manage_entry: stranger, campaign entry', $$select public.can_manage_entry('{ec}')::text$$, 'false');
select pg_temp.value_is(pg_temp.id('stranger'), 'can_manage_entry: stranger, library entry', $$select public.can_manage_entry('{el}')::text$$, 'false');
select pg_temp.value_is(pg_temp.id('gm'),       'can_manage_entry: missing entry',          $$select public.can_manage_entry('{n9}')::text$$, 'false');
select pg_temp.denied(null, 'can_manage_entry: signed out', 'permission denied', $$select public.can_manage_entry('{ec}')$$);

-- Map markers still follow the entries they link.
select pg_temp.allowed(pg_temp.id('root'), 'fixture: marker on the map',
  $$insert into public.world_map_markers (map_id, entry_id, x, y) values ('{emap}', '{ec}', 10, 10)$$);
select pg_temp.sees('marker on a hidden map', $$select 1 from public.world_map_markers where map_id = '{emap}'$$, 1, 0, 0, 0);

-- Writing. may(label, statement, GM, player, owner, stranger): true = must
-- succeed, false = must be refused. Refusals run first, so a success never
-- changes what the others are refused on.

-- Entries of a campaign.
select pg_temp.may('rename campaign entry',  $$select public.rename_world_entry('{ec}', 'Renamed')$$,                         true, false, false, false);
select pg_temp.may('reveal campaign entry',  $$select public.set_world_entry_revealed('{dc}', true)$$,                        true, false, false, false);
select pg_temp.may('delete campaign entry',  $$select public.delete_world_entry('{dc}')$$,                                    true, false, false, false);
select pg_temp.may('field value, campaign', $$select public.set_world_entry_field_value('{ec}', 'role', 'short_text', '"Cook"')$$, true, false, false, false);
select pg_temp.may('field privacy, campaign', $$select public.set_world_entry_field_private('{ec}', 'role', 'short_text', true)$$,  true, false, false, false);
select pg_temp.may('reorder campaign',       $$select public.reorder_world_entries('{c1}', array['{ech}'::uuid, '{ec}'::uuid])$$, true, false, false, false);
select pg_temp.may('create campaign entry',  $$select public.create_world_entry('{c1}', 'item', 'Lamp')$$,                    true, false, false, false);

-- Entries of a library: only the owner. Revealing is refused even for them.
select pg_temp.may('rename library entry',  $$select public.rename_world_entry('{el}', 'Renamed')$$,                         false, false, true, false);
select pg_temp.may('delete library entry',  $$select public.delete_world_entry('{dl}')$$,                                    false, false, true, false);
select pg_temp.may('field value, library',  $$select public.set_world_entry_field_value('{el}', 'role', 'short_text', '"Cook"')$$, false, false, true, false);
select pg_temp.may('field privacy, library', $$select public.set_world_entry_field_private('{el}', 'role', 'short_text', true)$$,  false, false, true, false);
select pg_temp.denied(pg_temp.id('gm'),       'reveal library entry / GM',       'not allowed', $$select public.set_world_entry_revealed('{el}', true)$$);
select pg_temp.denied(pg_temp.id('player'),   'reveal library entry / player',   'not allowed', $$select public.set_world_entry_revealed('{el}', true)$$);
select pg_temp.denied(pg_temp.id('stranger'), 'reveal library entry / stranger', 'not allowed', $$select public.set_world_entry_revealed('{el}', true)$$);
select pg_temp.denied(pg_temp.id('owner'), 'reveal library entry: owner is told why', 'cannot be revealed',
  $$select public.set_world_entry_revealed('{el}', true)$$);
select pg_temp.value_is(pg_temp.id('owner'), 'library entry stays hidden', $$select revealed::text from public.world_entries where id = '{el}'$$, 'false');

-- The write did what it said.
select pg_temp.value_is(pg_temp.id('gm'), 'rename changed the name', $$select name from public.world_entries where id = '{ec}'$$, 'Renamed');
select pg_temp.value_is(pg_temp.id('gm'), 'field privacy changed', $$select private::text from public.world_entry_fields where entry_id = '{ec}' and key = 'role'$$, 'true');
select pg_temp.value_is(pg_temp.id('owner'), 'library field changed', $$select value #>> '{}' from public.world_entry_fields where entry_id = '{el}' and key = 'role'$$, 'Cook');
select pg_temp.count_is(pg_temp.id('gm'), 'deleted campaign entry is gone', $$select 1 from public.world_entries where id = '{dc}'$$, 0);
select pg_temp.count_is(pg_temp.id('owner'), 'deleted library entry is gone', $$select 1 from public.world_entries where id = '{dl}'$$, 0);

-- Library creation: anyone signed in, in their own library only.
select pg_temp.may('create library entry', $$select public.create_library_entry('character', 'Mine')$$, true, true, true, true);
select pg_temp.denied(null, 'create library entry: signed out', 'permission denied', $$select public.create_library_entry('character', 'Mine')$$);
select pg_temp.may('create library map', $$select public.create_library_entry('map', 'World')$$, true, true, true, true);
select pg_temp.denied(pg_temp.id('owner'), 'create library entry: needs a name', 'Give the entry a name', $$select public.create_library_entry('item', '   ')$$);
select pg_temp.sees('new library entries stay private', $$select 1 from public.world_entries where name = 'Mine'$$, 1, 1, 1, 1);

-- Library order: only the caller's own entries move.
select pg_temp.allowed(pg_temp.id('owner'), 'reorder library',
  $$select public.reorder_library_entries(array['{elg}'::uuid, '{el}'::uuid])$$);
select pg_temp.value_is(pg_temp.id('gm'), 'reorder library: another person''s entry untouched', $$select sort_order::text from public.world_entries where id = '{elg}'$$, '7');
select pg_temp.value_is(pg_temp.id('owner'), 'reorder library: own entry moved', $$select sort_order::text from public.world_entries where id = '{el}'$$, '2');
select pg_temp.denied(null, 'reorder library: signed out', 'permission denied', $$select public.reorder_library_entries(array['{el}'::uuid])$$);

-- Direct writes to the tables are closed to everyone.
select pg_temp.no_effect(pg_temp.id('gm'),       'direct update, GM',       $$update public.world_entries set name = 'x' where id in ('{ec}', '{el}')$$);
select pg_temp.no_effect(pg_temp.id('owner'),    'direct update, owner',    $$update public.world_entries set name = 'x' where id in ('{ec}', '{el}')$$);
select pg_temp.no_effect(pg_temp.id('player'),   'direct update, player',   $$update public.world_entries set name = 'x' where id in ('{ec}', '{el}')$$);
select pg_temp.no_effect(pg_temp.id('stranger'), 'direct update, stranger', $$update public.world_entries set name = 'x' where id in ('{ec}', '{el}')$$);
select pg_temp.no_effect(pg_temp.id('gm'),       'direct delete, GM',       $$delete from public.world_entries where id in ('{ec}', '{el}')$$);
select pg_temp.no_effect(pg_temp.id('owner'),    'direct delete, owner',    $$delete from public.world_entries where id in ('{ec}', '{el}')$$);
select pg_temp.no_effect(pg_temp.id('owner'),    'direct insert, owner',    $$insert into public.world_entries (kind, name, owner_id) values ('item', 'x', '{owner}')$$);
select pg_temp.no_effect(pg_temp.id('gm'),       'direct insert, GM',       $$insert into public.world_entries (kind, name, campaign_id) values ('item', 'x', '{c1}')$$);
select pg_temp.no_effect(pg_temp.id('owner'),    'direct field update, owner', $$update public.world_entry_fields set value = '"x"' where entry_id = '{el}'$$);
select pg_temp.no_effect(pg_temp.id('gm'),       'direct field update, GM', $$update public.world_entry_fields set value = '"x"' where entry_id = '{ec}'$$);
select pg_temp.no_effect(pg_temp.id('gm'),       'direct field insert, GM', $$insert into public.world_entry_fields (entry_id, key, type) values ('{ec}', 'zz', 'short_text')$$);

-- Database rules a library entry can never break, even as the database owner.
select pg_temp.denied(pg_temp.id('root'), 'a library entry cannot be revealed', 'world_entries_library_not_revealed',
  $$update public.world_entries set revealed = true where id = '{el}'$$);
select pg_temp.denied(pg_temp.id('root'), 'an entry has exactly one home', 'check',
  $$insert into public.world_entries (kind, name, owner_id, campaign_id) values ('item', 'x', '{owner}', '{c1}')$$);

-- Functions that must not be callable signed out.
select pg_temp.denied(null, 'signed out: rename',  'permission denied', $$select public.rename_world_entry('{ec}', 'x')$$);
select pg_temp.denied(null, 'signed out: delete',  'permission denied', $$select public.delete_world_entry('{ec}')$$);
select pg_temp.denied(null, 'signed out: fields',  'permission denied', $$select * from public.get_world_entry_fields('{ec}')$$);
select pg_temp.denied(null, 'signed out: copy',    'permission denied', $$select public.copy_world_entry('{ec}', '{n9}')$$);
select pg_temp.denied(null, 'signed out: folder check', 'permission denied', $$select public.has_world_folder_access('{c1}/x/1.webp')$$);

-- Pins stay campaign-only: a library map can never have any.
select pg_temp.may('add marker', $$select public.add_map_marker('{emap}', '{ech}', 20, 20)$$, true, false, false, false);
select pg_temp.denied(pg_temp.id('gm'), 'marker cannot link a library entry', 'does not belong',
  $$select public.add_map_marker('{emap}', '{elg}', 30, 30)$$);
select pg_temp.denied(pg_temp.id('owner'), 'a library entry is not a map', 'not allowed',
  $$select public.add_map_marker('{el}', '{dl}', 30, 30)$$);

-- copy_world_entry(source, new id, target campaign or null for the library,
-- path of the already-copied image file).

-- Who may save a campaign entry to a library. Only a GM: a player could not
-- read its private fields.
select pg_temp.may('save to library',
  $$select public.copy_world_entry('{ec}', '{n1}', null, '{gm}/{n1}/1.webp')$$,
  true, false, false, false, 'not allowed to copy');
select pg_temp.allowed(pg_temp.id('gm'), 'save a hidden entry without an image',
  $$select public.copy_world_entry('{ech}', '{n2}')$$);
select pg_temp.allowed(pg_temp.id('gm'), 'save an entry with a template portrait',
  $$select public.copy_world_entry('{ect}', '{n3}')$$);
select pg_temp.allowed(pg_temp.id('stranger'), 'another GM saves their own entry',
  $$select public.copy_world_entry('{ed}', '{n4}')$$);

-- What the saved copy looks like.
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: owned by the GM, hidden, remembers its source',
  $$select (owner_id = '{gm}' and campaign_id is null and not revealed and source_entry_id = '{ec}' and created_by = '{gm}')::text
    from public.world_entries where id = '{n1}'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: name kept', $$select name from public.world_entries where id = '{n1}'$$, 'Renamed');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: goes to the top of the library',
  $$select (sort_order < (select min(sort_order) from public.world_entries where owner_id = '{gm}' and id <> '{n1}'))::text
    from public.world_entries where id = '{n1}'$$, 'true');
select pg_temp.count_is(pg_temp.id('gm'), 'library copy: every field copied', $$select 1 from public.world_entry_fields where entry_id = '{n1}'$$, 5);
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: private flag kept', $$select private::text from public.world_entry_fields where entry_id = '{n1}' and key = 'secret'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: private empty field kept', $$select private::text from public.world_entry_fields where entry_id = '{n1}' and key = 'empty_secret'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: public field stays public', $$select private::text from public.world_entry_fields where entry_id = '{n1}' and key = 'stat_block'$$, 'false');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: current health dropped', $$select (value ? 'healthCurrent')::text from public.world_entry_fields where entry_id = '{n1}' and key = 'stat_block'$$, 'false');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: rest of the stat block kept', $$select value ->> 'health' || '/' || (value ->> 'defense') from public.world_entry_fields where entry_id = '{n1}' and key = 'stat_block'$$, '10/2');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: image path rewritten', $$select value ->> 'path' from public.world_entry_fields where entry_id = '{n1}' and key = 'image'$$, '{gm}/{n1}/1.webp');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: image url rewritten', $$select value ->> 'url' from public.world_entry_fields where entry_id = '{n1}' and key = 'image'$$,
  'https://x.supabase.co/storage/v1/object/public/world-images/{gm}/{n1}/1.webp');
select pg_temp.value_is(pg_temp.id('gm'), 'library copy: image size kept', $$select value ->> 'width' from public.world_entry_fields where entry_id = '{n1}' and key = 'image'$$, '100');
select pg_temp.value_is(pg_temp.id('gm'), 'source unchanged: still damaged', $$select (value ->> 'healthCurrent') from public.world_entry_fields where entry_id = '{ec}' and key = 'stat_block'$$, '3');
select pg_temp.value_is(pg_temp.id('gm'), 'source unchanged: image path', $$select value ->> 'path' from public.world_entry_fields where entry_id = '{ec}' and key = 'image'$$, '{c1}/{ec}/1.webp');
select pg_temp.value_is(pg_temp.id('gm'), 'template portrait is shared, url', $$select value ->> 'url' from public.world_entry_fields where entry_id = '{n3}' and key = 'image'$$, '/portraits/bram.webp');
select pg_temp.value_is(pg_temp.id('gm'), 'template portrait is shared, no path', $$select value ->> 'path' from public.world_entry_fields where entry_id = '{n3}' and key = 'image'$$, null);
select pg_temp.sees('saved copy is private to its owner', $$select 1 from public.world_entries where id = '{n1}'$$, 1, 0, 0, 0);

-- Adding from a library: needs to own the entry and manage the campaign.
select pg_temp.may('add from library',
  $$select public.copy_world_entry('{elg}', '{n5}', '{c1}', '{c1}/{n5}/1.webp')$$,
  true, false, false, false, 'not allowed to copy');
select pg_temp.value_is(pg_temp.id('gm'), 'campaign copy: in the campaign, hidden, remembers its source',
  $$select (campaign_id = '{c1}' and owner_id is null and not revealed and source_entry_id = '{elg}')::text
    from public.world_entries where id = '{n5}'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'campaign copy: goes to the top of the list',
  $$select (sort_order < (select min(sort_order) from public.world_entries where campaign_id = '{c1}' and id <> '{n5}'))::text
    from public.world_entries where id = '{n5}'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'campaign copy: private flag kept', $$select private::text from public.world_entry_fields where entry_id = '{n5}' and key = 'secret'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'campaign copy: current health dropped', $$select (value ? 'healthCurrent')::text from public.world_entry_fields where entry_id = '{n5}' and key = 'stat_block'$$, 'false');
select pg_temp.value_is(pg_temp.id('gm'), 'campaign copy: image path rewritten', $$select value ->> 'path' from public.world_entry_fields where entry_id = '{n5}' and key = 'image'$$, '{c1}/{n5}/1.webp');
select pg_temp.sees('campaign copy stays hidden from players', $$select 1 from public.world_entries where id = '{n5}'$$, 1, 0, 0, 0);

-- Wrong container or wrong person.
select pg_temp.denied(pg_temp.id('gm'),       'GM cannot add to a campaign they do not manage', 'not allowed to add', $$select public.copy_world_entry('{elg}', '{n9}', '{c2}')$$);
select pg_temp.denied(pg_temp.id('gm'),       'GM cannot copy the owner''s library entry', 'not allowed to copy', $$select public.copy_world_entry('{el}', '{n9}', '{c1}')$$);
select pg_temp.denied(pg_temp.id('owner'),    'owner cannot add to a campaign they are not in', 'not allowed to add', $$select public.copy_world_entry('{el}', '{n9}', '{c1}')$$);
select pg_temp.denied(pg_temp.id('stranger'), 'stranger cannot copy a library entry', 'not allowed to copy', $$select public.copy_world_entry('{el}', '{n9}', '{c2}')$$);
select pg_temp.denied(pg_temp.id('owner'),    'library to library', 'Add library entries', $$select public.copy_world_entry('{el}', '{n9}')$$);
select pg_temp.denied(pg_temp.id('gm'),       'campaign to the same campaign', 'Save campaign entries', $$select public.copy_world_entry('{ec}', '{n9}', '{c1}')$$);
select pg_temp.denied(pg_temp.id('gm'),       'campaign to another campaign', 'Save campaign entries', $$select public.copy_world_entry('{ec}', '{n9}', '{c2}')$$);
select pg_temp.denied(pg_temp.id('gm'),       'new id already taken', 'already exists', $$select public.copy_world_entry('{ec}', '{ech}', null, '{gm}/{ech}/1.webp')$$);

-- The image path is checked.
select pg_temp.denied(pg_temp.id('gm'), 'image: path missing', 'Copy the image file first', $$select public.copy_world_entry('{ec}', '{n9}')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: another campaign''s folder', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{c2}/{n9}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: the source campaign''s folder', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{c1}/{n9}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: another person''s folder', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{owner}/{n9}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: another entry''s folder', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{gm}/{n8}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: deeper folder', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{gm}/{n9}/a/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: no file name', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{gm}/{n9}/')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: dots in the name', 'right folder', $$select public.copy_world_entry('{ec}', '{n9}', null, '{gm}/{n9}/..1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: library folder for a campaign copy', 'right folder', $$select public.copy_world_entry('{elg}', '{n9}', '{c1}', '{gm}/{n9}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: file was never copied', 'not found', $$select public.copy_world_entry('{ec}', '{n9}', null, '{gm}/{n9}/missing.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: template portrait takes no file', 'no image file', $$select public.copy_world_entry('{ect}', '{n9}', null, '{gm}/{n9}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: no image at all takes no file', 'no image file', $$select public.copy_world_entry('{ech}', '{n9}', null, '{gm}/{n9}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: url that does not match the path', 'cannot be copied', $$select public.copy_world_entry('{ebad}', '{n6}', null, '{gm}/{n6}/1.webp')$$);
select pg_temp.denied(pg_temp.id('gm'), 'image: a second image with a file', 'cannot be copied', $$select public.copy_world_entry('{emulti}', '{n7}', null, '{gm}/{n7}/1.webp')$$);
select pg_temp.count_is(pg_temp.id('root'), 'refused copies leave nothing behind', $$select 1 from public.world_entries where id in ('{n9}', '{n6}', '{n7}')$$, 0);

-- Maps: the image (in world-maps) and the scene are copied, the pins are not.
-- emap gets an image and a published scene; n10 is its copy in the GM's
-- library, n11 that copy added back to the campaign.
insert into pg_temp.test_ids values
  ('n10', 'f0000000-0000-0000-0000-00000000000a'),
  ('n11', 'f0000000-0000-0000-0000-00000000000b');

insert into public.world_entry_fields (entry_id, key, type, value, private)
values (pg_temp.id('emap'), 'image', 'image', jsonb_build_object(
  'url', 'https://x.supabase.co/storage/v1/object/public/world-maps/' || pg_temp.fill('{c1}/{emap}/m.webp'),
  'path', pg_temp.fill('{c1}/{emap}/m.webp'), 'width', 100, 'height', 80), false);

insert into public.world_map_scenes (map_id, scene, scene_version, rendered_at)
values (pg_temp.id('emap'), '{"version":1}', 1, now());

insert into storage.objects (bucket_id, name)
select 'world-maps', pg_temp.fill(p)
from unnest(array['{gm}/{n10}/m.webp', '{c1}/{n11}/m.webp']) as p;

-- That file exists, but in world-images, and a map's image lives in world-maps.
select pg_temp.denied(pg_temp.id('gm'), 'map image is looked for in world-maps', 'not found',
  $$select public.copy_world_entry('{emap}', '{n9}', null, '{gm}/{n9}/1.webp')$$);

select pg_temp.allowed(pg_temp.id('gm'), 'save a map to the library',
  $$select public.copy_world_entry('{emap}', '{n10}', null, '{gm}/{n10}/m.webp')$$);
select pg_temp.value_is(pg_temp.id('gm'), 'map copy: a map in the library, remembers its source',
  $$select (kind = 'map' and owner_id = '{gm}' and source_entry_id = '{emap}')::text from public.world_entries where id = '{n10}'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'map copy: image path rewritten', $$select value ->> 'path' from public.world_entry_fields where entry_id = '{n10}' and key = 'image'$$, '{gm}/{n10}/m.webp');
select pg_temp.value_is(pg_temp.id('gm'), 'map copy: image url rewritten', $$select value ->> 'url' from public.world_entry_fields where entry_id = '{n10}' and key = 'image'$$,
  'https://x.supabase.co/storage/v1/object/public/world-maps/{gm}/{n10}/m.webp');
select pg_temp.value_is(pg_temp.id('gm'), 'map copy: image size kept', $$select (value ->> 'width') || 'x' || (value ->> 'height') from public.world_entry_fields where entry_id = '{n10}' and key = 'image'$$, '100x80');
select pg_temp.count_is(pg_temp.id('gm'), 'map copy: scene copied', $$select 1 from public.world_map_scenes where map_id = '{n10}'$$, 1);
select pg_temp.value_is(pg_temp.id('gm'), 'map copy: scene is the same, and published',
  $$select (scene = '{"version":1}'::jsonb and rendered_at is not null)::text from public.world_map_scenes where map_id = '{n10}'$$, 'true');
select pg_temp.count_is(pg_temp.id('root'), 'map copy: pins left behind', $$select 1 from public.world_map_markers where map_id = '{n10}'$$, 0);
select pg_temp.count_is(pg_temp.id('root'), 'map copy: source keeps its pins', $$select 1 from public.world_map_markers where map_id = '{emap}'$$, 2);
select pg_temp.count_is(pg_temp.id('root'), 'map copy: source keeps its scene', $$select 1 from public.world_map_scenes where map_id = '{emap}'$$, 1);
select pg_temp.sees('library map scene is private to its owner', $$select 1 from public.world_map_scenes where map_id = '{n10}'$$, 1, 0, 0, 0);
select pg_temp.denied(pg_temp.id('gm'), 'a library map takes no pins', 'not allowed', $$select public.add_map_marker('{n10}', '{elg}', 20, 20)$$);

-- A library map is changed like a campaign map, by its owner only.
select pg_temp.allowed(pg_temp.id('gm'), 'library map: save the scene',
  $$select public.save_map_scene('{n10}', '{"version":1,"a":1}'::jsonb, (select updated_at from public.world_map_scenes where map_id = '{n10}'), true)$$);
select pg_temp.denied(pg_temp.id('owner'), 'library map: another person cannot save the scene', 'not allowed',
  $$select public.save_map_scene('{n10}', '{"version":1}'::jsonb)$$);
select pg_temp.denied(pg_temp.id('stranger'), 'library map: another person cannot discard the scene', 'not allowed',
  $$select public.discard_map_scene('{n10}')$$);
select pg_temp.denied(pg_temp.id('gm'), 'library map: a stale scene is refused', 'changed somewhere else',
  $$select public.save_map_scene('{n10}', '{"version":1}'::jsonb, now() - interval '1 day')$$);
select pg_temp.denied(pg_temp.id('gm'), 'library map: a non-map has no scene', 'not a map',
  $$select public.save_map_scene('{elg}', '{"version":1}'::jsonb)$$);

select pg_temp.allowed(pg_temp.id('gm'), 'add a library map to a campaign',
  $$select public.copy_world_entry('{n10}', '{n11}', '{c1}', '{c1}/{n11}/m.webp')$$);
select pg_temp.value_is(pg_temp.id('gm'), 'campaign map copy: in the campaign, hidden, remembers its source',
  $$select (kind = 'map' and campaign_id = '{c1}' and owner_id is null and not revealed and source_entry_id = '{n10}')::text from public.world_entries where id = '{n11}'$$, 'true');
select pg_temp.value_is(pg_temp.id('gm'), 'campaign map copy: image path rewritten', $$select value ->> 'path' from public.world_entry_fields where entry_id = '{n11}' and key = 'image'$$, '{c1}/{n11}/m.webp');
select pg_temp.count_is(pg_temp.id('gm'), 'campaign map copy: scene copied', $$select 1 from public.world_map_scenes where map_id = '{n11}'$$, 1);
select pg_temp.count_is(pg_temp.id('root'), 'campaign map copy: starts with no pins', $$select 1 from public.world_map_markers where map_id = '{n11}'$$, 0);
select pg_temp.sees('campaign map copy stays hidden from players', $$select 1 from public.world_entries where id = '{n11}'$$, 1, 0, 0, 0);
select pg_temp.allowed(pg_temp.id('gm'), 'campaign map copy: pins can be added', $$select public.add_map_marker('{n11}', '{ec}', 20, 20)$$);

select pg_temp.allowed(pg_temp.id('gm'), 'library map: discard the scene', $$select public.discard_map_scene('{n10}')$$);
select pg_temp.count_is(pg_temp.id('root'), 'library map: scene discarded', $$select 1 from public.world_map_scenes where map_id = '{n10}'$$, 0);
select pg_temp.allowed(pg_temp.id('gm'), 'library map: delete it', $$select public.delete_world_entry('{n10}')$$);
select pg_temp.count_is(pg_temp.id('root'), 'library map: deleting it removes its scene', $$select 1 from public.world_map_scenes where map_id = '{n10}'$$, 0);

-- Copies and sources live separate lives.
select pg_temp.allowed(pg_temp.id('gm'), 'edit the copy', $$select public.rename_world_entry('{n1}', 'Copy only')$$);
select pg_temp.value_is(pg_temp.id('gm'), 'editing the copy leaves the source', $$select name from public.world_entries where id = '{ec}'$$, 'Renamed');
select pg_temp.allowed(pg_temp.id('gm'), 'delete the copy', $$select public.delete_world_entry('{n1}')$$);
select pg_temp.count_is(pg_temp.id('gm'), 'deleting the copy leaves the source', $$select 1 from public.world_entries where id = '{ec}'$$, 1);
select pg_temp.allowed(pg_temp.id('gm'), 'delete the source', $$select public.delete_world_entry('{elg}')$$);
select pg_temp.value_is(pg_temp.id('gm'), 'deleting the source leaves the copy, forgetting it',
  $$select (source_entry_id is null)::text from public.world_entries where id = '{n5}'$$, 'true');

-- Image files. Library files live under "<user id>/", campaign files under
-- "<campaign id>/". Maps follow the same rule in world-maps.

select pg_temp.may('upload to the campaign folder', $$insert into storage.objects (bucket_id, name) values ('world-images', '{c1}/{x1}/a.webp')$$,       true,  false, false, false, 'row-level security');
select pg_temp.may('upload to another campaign',    $$insert into storage.objects (bucket_id, name) values ('world-images', '{c2}/{x1}/a.webp')$$,       false, false, false, true,  'row-level security');
select pg_temp.may('upload to the GM''s own folder',       $$insert into storage.objects (bucket_id, name) values ('world-images', '{gm}/{x1}/a.webp')$$,       true,  false, false, false, 'row-level security');
select pg_temp.may('upload to the player''s own folder',   $$insert into storage.objects (bucket_id, name) values ('world-images', '{player}/{x1}/a.webp')$$,   false, true,  false, false, 'row-level security');
select pg_temp.may('upload to the owner''s own folder',    $$insert into storage.objects (bucket_id, name) values ('world-images', '{owner}/{x1}/a.webp')$$,    false, false, true,  false, 'row-level security');
select pg_temp.may('upload to the stranger''s own folder', $$insert into storage.objects (bucket_id, name) values ('world-images', '{stranger}/{x1}/a.webp')$$, false, false, false, true,  'row-level security');
select pg_temp.may('upload a map to the campaign folder', $$insert into storage.objects (bucket_id, name) values ('world-maps', '{c1}/{x1}/m.webp')$$,   true,  false, false, false, 'row-level security');
select pg_temp.may('upload a map to the owner''s own folder',   $$insert into storage.objects (bucket_id, name) values ('world-maps', '{owner}/{x1}/m.webp')$$, false, false, true, false, 'row-level security');
select pg_temp.may('upload a map to another campaign',    $$insert into storage.objects (bucket_id, name) values ('world-maps', '{c2}/{x2}/m.webp')$$, false, false, false, true, 'row-level security');

select pg_temp.sees('files are publicly readable', $$select 1 from storage.objects where bucket_id = 'world-images' and name = '{c1}/{x1}/a.webp'$$, 1, 1, 1, 1);

-- Changing and removing files.
select pg_temp.changes(pg_temp.id('gm'),       'update: GM cannot touch the owner''s file',   $$update storage.objects set metadata = '{"k":1}'::jsonb where bucket_id = 'world-images' and name = '{owner}/{x1}/a.webp'$$, 0);
select pg_temp.changes(pg_temp.id('stranger'), 'update: stranger cannot touch the campaign''s file', $$update storage.objects set metadata = '{"k":1}'::jsonb where bucket_id = 'world-images' and name = '{c1}/{x1}/a.webp'$$, 0);
select pg_temp.changes(pg_temp.id('owner'),    'update: owner changes their own file',         $$update storage.objects set metadata = '{"k":1}'::jsonb where bucket_id = 'world-images' and name = '{owner}/{x1}/a.webp'$$, 1);

select set_config('storage.allow_delete_query', 'true', true);
select pg_temp.changes(pg_temp.id('gm'),       'delete: GM cannot remove the owner''s file',   $$delete from storage.objects where bucket_id = 'world-images' and name = '{owner}/{x1}/a.webp'$$, 0);
select pg_temp.changes(pg_temp.id('player'),   'delete: player cannot remove the campaign''s file', $$delete from storage.objects where bucket_id = 'world-images' and name = '{c1}/{x1}/a.webp'$$, 0);
select pg_temp.changes(pg_temp.id('stranger'), 'delete: stranger cannot remove the campaign''s file', $$delete from storage.objects where bucket_id = 'world-images' and name = '{c1}/{x1}/a.webp'$$, 0);
select pg_temp.changes(pg_temp.id('owner'),    'delete: owner removes their own file',         $$delete from storage.objects where bucket_id = 'world-images' and name = '{owner}/{x1}/a.webp'$$, 1);
select pg_temp.changes(pg_temp.id('gm'),       'delete: GM removes a campaign file',           $$delete from storage.objects where bucket_id = 'world-images' and name = '{c1}/{x1}/a.webp'$$, 1);

-- Campaigns behave as before, and library data goes away with its owner.

select pg_temp.allowed(pg_temp.id('player'), 'create a campaign with starter entries',
  $$select public.create_campaign('Regression', '[{"kind":"character","name":"Bram","fields":[{"key":"role","type":"short_text","value":"Cook","private":false}]}]'::jsonb)$$);
select pg_temp.count_is(pg_temp.id('player'), 'starter entry arrives hidden, with its field',
  $$select 1 from public.world_entries e join public.world_entry_fields f on f.entry_id = e.id
    where e.name = 'Bram' and not e.revealed and f.key = 'role'$$, 1);
select pg_temp.allowed(pg_temp.id('player'), 'delete that campaign',
  $$select public.delete_campaign((select id from public.campaigns where name = 'Regression'), 'Regression')$$);
select pg_temp.count_is(pg_temp.id('root'), 'deleting a campaign removes its entries', $$select 1 from public.world_entries where name = 'Bram'$$, 0);

select pg_temp.allowed(pg_temp.id('root'), 'delete a user', $$delete from auth.users where id = '{owner}'$$);
select pg_temp.count_is(pg_temp.id('root'), 'deleting a user removes their library', $$select 1 from public.world_entries where owner_id = '{owner}'$$, 0);
select pg_temp.count_is(pg_temp.id('root'), 'deleting a user leaves campaign entries alone', $$select 1 from public.world_entries where campaign_id = '{c1}'$$, 9);

rollback;

-- The result: a summary row, then every check with failures first.
with log as (
  select split_part(line, '|', 1) as result,
         substr(line, position('|' in line) + 1) as test,
         n
  from unnest(string_to_array(trim(trailing chr(10) from current_setting('test.log')), chr(10)))
       with ordinality as t (line, n)
)
select result, test
from (
  select 0 as n,
         case when count(*) filter (where result = 'FAIL') = 0 then 'ALL PASSED' else 'FAILED' end as result,
         count(*) || ' checks, ' || count(*) filter (where result = 'FAIL') || ' failed' as test
  from log
  union all
  select n, result, test from log
) r
order by case when n = 0 then 0 when result = 'FAIL' then 1 else 2 end, n;
