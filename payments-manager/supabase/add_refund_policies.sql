-- Add missing RLS policies for refunds
create policy "Users can insert refunds for own payments" on public.refunds for insert with check (
  exists (select 1 from public.payments where payments.id = payment_id and payments.user_id = auth.uid())
);

create policy "Users can update refunds for own payments" on public.refunds for update using (
  exists (select 1 from public.payments where payments.id = refunds.payment_id and payments.user_id = auth.uid())
);

create policy "Users can delete refunds for own payments" on public.refunds for delete using (
  exists (select 1 from public.payments where payments.id = refunds.payment_id and payments.user_id = auth.uid())
);
