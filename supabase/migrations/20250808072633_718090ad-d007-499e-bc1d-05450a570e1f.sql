
-- Ensure RLS is enabled (safe to run even if already enabled)
alter table public.products enable row level security;

-- Replace the existing policy with one that uses the shared role checker
drop policy if exists "Admins can manage products" on public.products;

create policy "Admins can manage products"
on public.products
for all
to public
using (
  public.has_role(auth.uid(), 'admin') 
  or public.has_role(auth.uid(), 'developer')
)
with check (
  public.has_role(auth.uid(), 'admin') 
  or public.has_role(auth.uid(), 'developer')
);
