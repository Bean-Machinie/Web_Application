-- Whether the signed-in person has a password. Someone who signed up with
-- Discord or Google and later set one gets no "email" identity, so the
-- identity list cannot say. The stored hash can, but only the server can read
-- it. This returns a yes or no and never the hash.
create function public.has_password()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select encrypted_password <> '' from auth.users where id = auth.uid()),
    false
  );
$$;

revoke execute on function public.has_password() from public, anon;
grant execute on function public.has_password() to authenticated;
