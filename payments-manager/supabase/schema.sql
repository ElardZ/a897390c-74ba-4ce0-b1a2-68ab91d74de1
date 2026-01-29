create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone
);

create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  relation text,
  created_at timestamp with time zone default now()
);

create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  family_member_id uuid references public.family_members(id),
  service_name text not null,
  amount numeric not null,
  date date not null,
  status text default 'paid',
  notes text,
  created_at timestamp with time zone default now()
);

create table public.refunds (
  id uuid default gen_random_uuid() primary key,
  payment_id uuid references public.payments(id) not null,
  amount numeric not null,
  date date default current_date,
  note text
);

alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own family members" on public.family_members for select using (auth.uid() = user_id);
create policy "Users can insert own family members" on public.family_members for insert with check (auth.uid() = user_id);

create policy "Users can view own payments" on public.payments for select using (auth.uid() = user_id);
create policy "Users can insert own payments" on public.payments for insert with check (auth.uid() = user_id);

create policy "Users can view refunds for own payments" on public.refunds for select using (
  exists (select 1 from public.payments where payments.id = refunds.payment_id and payments.user_id = auth.uid())
);
