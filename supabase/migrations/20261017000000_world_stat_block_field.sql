-- A structured stat block for creatures. The value is one JSON document
-- ({ v, health, defense, speed, actions: [{ id, name, text }] }), so growing
-- it later needs no schema change. Privacy, saving and the "Undisclosed"
-- rules all work on any field type already.

alter type public.world_field_type add value 'stat_block';
