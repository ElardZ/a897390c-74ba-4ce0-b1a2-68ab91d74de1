-- Drop existing policies if they exist to avoid confusion
drop policy if exists "Users can insert refunds for own payments" on public.refunds;
drop policy if exists "Users can update refunds for own payments" on public.refunds;
drop policy if exists "Users can delete refunds for own payments" on public.refunds;
drop policy if exists "Users can view refunds for own payments" on public.refunds;

-- Re-create simplified policies that actually work
create policy "Users can view refunds for own payments" on public.refunds for select using (
  exists (
    select 1 from public.payments 
    where payments.id = refunds.payment_id 
    and payments.user_id = auth.uid()
  )
);

-- IMPORTANT: For insert, we need to check the payment_id provided in the new row
create policy "Users can insert refunds for own payments" on public.refunds for insert with check (
  exists (
    select 1 from public.payments 
    where payments.id = payment_id 
    and payments.user_id = auth.uid()
  )
);

create policy "Users can update refunds for own payments" on public.refunds for update using (
  exists (
    select 1 from public.payments 
    where payments.id = refunds.payment_id 
    and payments.user_id = auth.uid()
  )
);

create policy "Users can delete refunds for own payments" on public.refunds for delete using (
  exists (
    select 1 from public.payments 
    where payments.id = refunds.payment_id 
    and payments.user_id = auth.uid()
  )
);
