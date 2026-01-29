-- Allow user_id in payments to reference auth.users directly instead of public.profiles
alter table public.payments 
drop constraint payments_user_id_fkey,
add constraint payments_user_id_fkey foreign key (user_id) references auth.users(id);

-- Also, since we are not creating profiles on registration anymore (we skipped that trigger for simplicity),
-- let's make sure family_members also points to auth.users if needed, or simply remove the dependency on profiles for now.

-- Trigger to automatically create profile on signup (Best Practice Solution)
create or replace function public.handle_new_user() 
returns trigger as \$\$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
\$\$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Since you already have a user created without a profile, you might need to manually insert your profile row:
-- insert into public.profiles (id, email) values ('YOUR_USER_ID', 'YOUR_EMAIL');

