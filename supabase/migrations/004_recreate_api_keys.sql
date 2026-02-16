-- Drop and recreate api_keys with api_key column (avoids reserved word issues)
-- Run this in Supabase SQL Editor, then run: NOTIFY pgrst, 'reload schema';

DROP TABLE IF EXISTS public.api_keys CASCADE;

CREATE TABLE public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_key text not null,
  usage integer not null default 0,
  usage_limit integer,
  created_at timestamptz not null default now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access to api_keys" ON public.api_keys
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS api_keys_created_at_idx ON public.api_keys (created_at desc);
