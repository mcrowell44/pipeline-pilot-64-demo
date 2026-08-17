CREATE TYPE public.activity_kind AS ENUM ('Email Sent','Reply','Call','Meeting','Note');

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_step_due date;

CREATE TABLE public.lead_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  kind public.activity_kind NOT NULL DEFAULT 'Note',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activity TO anon, authenticated;
GRANT ALL ON public.lead_activity TO service_role;

ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Open access to lead activity" ON public.lead_activity FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_lead_activity_lead ON public.lead_activity(lead_id, occurred_at DESC);
CREATE INDEX idx_leads_next_step_due ON public.leads(next_step_due);

CREATE TRIGGER lead_activity_updated_at BEFORE UPDATE ON public.lead_activity FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();