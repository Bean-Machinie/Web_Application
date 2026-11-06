-- A creature's full stat block (the 2024 layout), copied from the compendium and edited by the
-- GM. The value is one JSON document, { statBlock, compendiumRef }, so growing it later needs no
-- schema change. It is separate from 'stat_block', the older health/defense/speed tracker.
-- Privacy, saving and the "Undisclosed" rules all work on any field type already, and the
-- copy and template functions pass its value through untouched.

alter type public.world_field_type add value 'creature_stats';
