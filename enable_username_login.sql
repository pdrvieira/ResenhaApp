-- Function to lookup email via username (Required for Username Login)
-- UPDATED V3: Fetches email from auth.users (Source of Truth) instead of public.users
-- This fixes issues where public.users might have empty email fields.

create or replace function get_email_by_username(username_input text)
returns text
language plpgsql
security definer -- Runs with admin privileges to see private emails
as $$
declare
  found_email text;
begin
  -- Search for username in public profiles, but get email from secure auth table
  select au.email into found_email
  from auth.users au
  join public.users pu on pu.id = au.id
  where lower(pu.username) = lower(username_input)
  limit 1;
  
  return found_email;
end;
$$;

-- Grant execution to anonymous users (so login screen can call it)
grant execute on function get_email_by_username to anon;
grant execute on function get_email_by_username to authenticated;
