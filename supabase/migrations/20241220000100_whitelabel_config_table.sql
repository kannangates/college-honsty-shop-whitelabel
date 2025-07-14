-- Create whitelabel_config table
create table if not exists public.whitelabel_config (
  id serial primary key,
  config jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.whitelabel_config enable row level security;

-- Policy: Admins can read config
create policy "Admins can read config" on public.whitelabel_config
  for select using (
    exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin')
  );

-- Policy: Admins can update config
create policy "Admins can update config" on public.whitelabel_config
  for update using (
    exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin')
  );

-- Policy: Admins can insert config (for initial setup)
create policy "Admins can insert config" on public.whitelabel_config
  for insert with check (
    exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin')
  ); 