-- Create api_keys table for Dandi
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_key text not null,
  usage integer not null default 0,
  usage_limit integer,
  created_at timestamptz not null default now()
);

-- Enable RLS (Row Level Security)
alter table public.api_keys enable row level security;

-- For server-side API routes using service role, RLS is bypassed.
-- If you add auth later, add policies like:
-- create policy "Users can manage own keys" on public.api_keys
--   for all using (auth.uid() = user_id);

-- Optional: Create index for faster lookups
create index if not exists api_keys_created_at_idx on public.api_keys (created_at desc);
