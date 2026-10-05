DROP POLICY IF EXISTS "Own leads" ON public.leads;
DROP POLICY IF EXISTS "Own drafts" ON public.outreach_drafts;
DROP POLICY IF EXISTS "Own activity" ON public.lead_activity;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads, public.outreach_drafts, public.lead_activity TO anon, authenticated;
CREATE POLICY "Open leads" ON public.leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open drafts" ON public.outreach_drafts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open activity" ON public.lead_activity FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);