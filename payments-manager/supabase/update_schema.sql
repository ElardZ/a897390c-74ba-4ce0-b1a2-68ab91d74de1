-- Add new columns to payments table
alter table public.payments 
add column if not exists beneficiary text,
add column if not exists payment_method text;

-- Drop foreign key constraint if it is too strict (optional, but 'beneficiary' text is more flexible for now)
-- alter table public.payments drop column family_member_id; 
-- We will just ignore family_member_id for now and use 'beneficiary' column.
