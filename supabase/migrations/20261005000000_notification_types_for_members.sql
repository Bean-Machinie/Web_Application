-- New notification types for removing a member and transferring ownership.
-- Kept in their own file: Postgres will not let a new enum value be used in
-- the transaction that adds it, and 20261006000000 uses them.

alter type public.notification_type add value 'removed_from_campaign';
alter type public.notification_type add value 'ownership_received';
alter type public.notification_type add value 'ownership_given';
