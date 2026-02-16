-- Rename 'key' to 'api_key' (key is a reserved word in PostgreSQL/Supabase)
-- Only runs if 'key' column exists (for tables created before this fix)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'key'
  ) THEN
    ALTER TABLE public.api_keys RENAME COLUMN "key" TO api_key;
  END IF;
END $$;
