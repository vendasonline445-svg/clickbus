
CREATE POLICY "Allow anonymous select on integration_keys"
ON public.integration_keys FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous update on integration_keys"
ON public.integration_keys FOR UPDATE TO anon USING (true) WITH CHECK (true);
