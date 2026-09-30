-- Invitations become notifications too. Kept in its own file: Postgres will
-- not let a new enum value be used in the transaction that adds it, and
-- 20261009000000 uses this one.

alter type public.notification_type add value 'campaign_invitation';
