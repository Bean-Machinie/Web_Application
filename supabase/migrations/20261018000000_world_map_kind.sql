-- A new kind of world entry: an uploaded map image with markers on it. In its
-- own file because a new enum value cannot be used in the transaction that
-- adds it.

alter type public.world_entry_kind add value 'map';
