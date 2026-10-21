-- Deleting entries no longer rewrites the documents that mention them.
--
-- The trigger did that in a BEFORE DELETE on world_entries, updating the fields
-- of other entries while the same command was deleting entries. Deleting
-- several that mention each other in one statement then failed with "tuple to
-- be updated was already modified by an operation triggered by the current
-- command", and the whole delete rolled back.
--
-- Nothing is lost by dropping it. The mention rows of a deleted entry go with it
-- (the foreign keys cascade), a player is given a mention as plain text unless
-- a row says they may follow it, and the app draws a mention of an entry that is
-- gone as plain text for everyone else. Entry ids are never reused, so the old
-- node in a document can never point at something new.

drop trigger world_entries_unlink_mentions on public.world_entries;
drop function public.unlink_mentions_of_deleted_entry();
