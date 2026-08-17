CREATE TYPE public.brand AS ENUM ('ZapAI','Newton Health');
CREATE TYPE public.play AS ENUM ('Apply','Subcontract','Both');
CREATE TYPE public.priority AS ENUM ('High','Medium','Low');
CREATE TYPE public.lead_type AS ENUM ('Employer','Recruiter');
CREATE TYPE public.stage AS ENUM ('New','Contacted','Replied','Discovery Booked','Meeting Held','Proposal Sent','Won','Lost','Needs Contact Info');
CREATE TYPE public.draft_status AS ENUM ('Draft','Approved','Sent','Bounced');

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact_name text,
  phone text,
  email text,
  website text,
  city text,
  state text,
  zip text,
  country text NOT NULL DEFAULT 'US',
  brand public.brand NOT NULL DEFAULT 'ZapAI',
  play public.play NOT NULL DEFAULT 'Apply',
  priority public.priority NOT NULL DEFAULT 'Medium',
  tech text,
  geo text,
  lead_type public.lead_type,
  role_title text,
  pay_range text,
  scan_source text,
  scan_date date,
  stage public.stage NOT NULL DEFAULT 'New',
  last_touch_at timestamptz,
  next_step text,
  notes text,
  ghl_contact_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.outreach_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  preview_text text,
  body_html text NOT NULL DEFAULT '',
  status public.draft_status NOT NULL DEFAULT 'Draft',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_leads_brand ON public.leads(brand);
CREATE INDEX idx_leads_scan_date ON public.leads(scan_date);
CREATE INDEX idx_drafts_lead ON public.outreach_drafts(lead_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outreach_drafts TO anon, authenticated;
GRANT ALL ON public.outreach_drafts TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Open access to leads" ON public.leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open access to drafts" ON public.outreach_drafts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER drafts_updated_at BEFORE UPDATE ON public.outreach_drafts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
