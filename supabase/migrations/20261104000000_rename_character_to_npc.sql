-- Player characters will come from a character builder, so the name "character" is
-- freed: the kind of entry for a non-player character is "npc". An enum value is only a
-- label, so every row, function, policy and index that uses it follows the rename.
alter type public.world_entry_kind rename value 'character' to 'npc';
