-- Only I-5 Google Workspace accounts can exist in this project.
-- Google already limits sign-in to i5design.com (Internal app) and the app checks too; this is the last line.
-- Run once in Supabase: SQL Editor > New query > paste > Run.

create or replace function public.enforce_i5_email_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or lower(new.email) not like '%@i5design.com' then
    raise exception 'Only @i5design.com accounts can use I-5 Install';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_i5_email_domain on auth.users;

create trigger enforce_i5_email_domain
  before insert or update of email on auth.users
  for each row execute function public.enforce_i5_email_domain();
