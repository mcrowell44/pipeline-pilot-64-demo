ALTER TYPE public.stage RENAME VALUE 'Contacted' TO 'Email Sent';
ALTER TYPE public.stage ADD VALUE IF NOT EXISTS 'Manually Contacted' AFTER 'Email Sent';