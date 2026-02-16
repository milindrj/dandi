-- Allow anon key to access api_keys (for development without service_role)
-- Remove or restrict this policy in production
create policy "Allow anon full access to api_keys" on public.api_keys
  for all using (true) with check (true);
