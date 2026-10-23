-- Characters can have toggle fields (proficiency, inspiration, armor in use) and line
-- fields (a single line of text, like a playbook or an alignment) added by their player.
-- A template's own fields never touch this enum: they live in code.
alter type public.character_field_type add value 'toggle';
alter type public.character_field_type add value 'line';
