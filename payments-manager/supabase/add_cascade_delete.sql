-- Drop the existing foreign key constraint
alter table public.refunds
drop constraint if exists refunds_payment_id_fkey;

-- Re-add it with ON DELETE CASCADE
alter table public.refunds
add constraint refunds_payment_id_fkey
foreign key (payment_id)
references public.payments(id)
on delete cascade;
