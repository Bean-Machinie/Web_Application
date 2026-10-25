-- Moves a character to a newer version of its template, which happens by itself the first
-- time its sheet is opened after a new version is released. Every field id keeps its
-- meaning from one version to the next, so no value is touched. Only ever up: a character
-- is never put back on an older sheet. The version is not a change the player made, so the
-- character's updated_at is left alone.
--
-- The 'choice' and 'attacks' kinds of field that version 2 of the D&D 5e sheet uses are
-- the template's own, in code, and are not added to character_field_type.

create function public.set_character_template_version(target_character uuid, new_version integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_version integer;
begin
  if not public.owns_character(target_character) then
    raise exception 'You are not allowed to change this character.';
  end if;

  select template_version into current_version
  from public.characters
  where id = target_character;

  if new_version < current_version then
    raise exception 'A character cannot go back to an older version of its sheet.';
  end if;

  update public.characters
  set template_version = new_version
  where id = target_character;
end;
$$;

revoke execute on function public.set_character_template_version(uuid, integer) from public, anon;
grant execute on function public.set_character_template_version(uuid, integer) to authenticated;
