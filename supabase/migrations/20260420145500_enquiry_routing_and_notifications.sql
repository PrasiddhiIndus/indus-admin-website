/*
  # Enquiry Routing and Team Notification Baseline

  This migration adds explicit routing metadata and notification tracking
  for both contact tables:
  - services_contact_form
  - contact_messages

  It introduces:
  - vertical / sub_vertical / assigned_team / team_email / status columns
  - notification_logs table
  - notification_queue table (for external worker / edge function processing)
  - trigger-based auto assignment and notification log+queue creation
*/

-- Add routing columns to existing enquiry tables
ALTER TABLE services_contact_form
  ADD COLUMN IF NOT EXISTS vertical TEXT,
  ADD COLUMN IF NOT EXISTS sub_vertical TEXT,
  ADD COLUMN IF NOT EXISTS assigned_team TEXT,
  ADD COLUMN IF NOT EXISTS team_email TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS vertical TEXT,
  ADD COLUMN IF NOT EXISTS sub_vertical TEXT,
  ADD COLUMN IF NOT EXISTS assigned_team TEXT,
  ADD COLUMN IF NOT EXISTS team_email TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Enforce valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'services_contact_form_status_check'
  ) THEN
    ALTER TABLE services_contact_form
      ADD CONSTRAINT services_contact_form_status_check
      CHECK (status IN ('new', 'notified', 'in_progress', 'closed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contact_messages_status_check'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_status_check
      CHECK (status IN ('new', 'notified', 'in_progress', 'closed'));
  END IF;
END $$;

-- Notification tracking for auditing and retries
CREATE TABLE IF NOT EXISTS notification_logs (
  id BIGSERIAL PRIMARY KEY,
  enquiry_table TEXT NOT NULL,
  enquiry_id BIGINT NOT NULL,
  vertical TEXT,
  sub_vertical TEXT,
  assigned_team TEXT,
  team_email TEXT,
  channel TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB,
  response JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_enquiry
  ON notification_logs (enquiry_table, enquiry_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status
  ON notification_logs (status);

CREATE TABLE IF NOT EXISTS notification_queue (
  id BIGSERIAL PRIMARY KEY,
  enquiry_table TEXT NOT NULL,
  enquiry_id BIGINT NOT NULL,
  assigned_team TEXT,
  team_email TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_processed
  ON notification_queue (processed, created_at);

-- Generic timestamp updater
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_logs_set_updated_at ON notification_logs;
CREATE TRIGGER trg_notification_logs_set_updated_at
BEFORE UPDATE ON notification_logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Infer vertical + team from available fields and message content
CREATE OR REPLACE FUNCTION assign_enquiry_routing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  content TEXT;
BEGIN
  content := lower(
    coalesce(NEW.vertical, '') || ' ' ||
    coalesce(NEW.sub_vertical, '') || ' ' ||
    coalesce(NEW.assigned_team, '') || ' ' ||
    coalesce(NEW.message, '') || ' ' ||
    coalesce(NEW.company, '')
  );

  -- Preserve explicit values if frontend already sends them
  IF NEW.vertical IS NULL OR NEW.vertical = '' THEN
    IF content LIKE '%nfpa%' OR content LIKE '%course%' OR content LIKE '%batch%' OR content LIKE '%fire safety%' THEN
      NEW.vertical := 'NFPA';
    ELSIF content LIKE '%career%' OR content LIKE '%job%' OR content LIKE '%hiring%' OR content LIKE '%resume%' THEN
      NEW.vertical := 'Careers';
    ELSIF content LIKE '%blog%' OR content LIKE '%article%' OR content LIKE '%news%' THEN
      NEW.vertical := 'Blogs';
    ELSIF TG_TABLE_NAME = 'services_contact_form'
      OR content LIKE '%service%'
      OR content LIKE '%manpower%'
      OR content LIKE '%truck%'
      OR content LIKE '%project%'
      OR content LIKE '%product%'
      OR content LIKE '%training%'
      OR content LIKE '%repair%' THEN
      NEW.vertical := 'Services';
    ELSE
      NEW.vertical := 'General';
    END IF;
  END IF;

  IF NEW.sub_vertical IS NULL OR NEW.sub_vertical = '' THEN
    IF NEW.vertical = 'Services' THEN
      IF content LIKE '%manpower%' THEN NEW.sub_vertical := 'Manpower';
      ELSIF content LIKE '%truck%' THEN NEW.sub_vertical := 'Trucks';
      ELSIF content LIKE '%project%' THEN NEW.sub_vertical := 'Projects';
      ELSIF content LIKE '%product%' THEN NEW.sub_vertical := 'Products';
      ELSIF content LIKE '%training%' THEN NEW.sub_vertical := 'Training';
      ELSIF content LIKE '%repair%' OR content LIKE '%maintenance%' THEN NEW.sub_vertical := 'Repair & Maintenance';
      ELSE NEW.sub_vertical := 'Other Services';
      END IF;
    ELSIF NEW.vertical = 'NFPA' THEN
      IF content LIKE '%batch%' THEN NEW.sub_vertical := 'Batches';
      ELSIF content LIKE '%course%' THEN NEW.sub_vertical := 'Courses';
      ELSE NEW.sub_vertical := 'General NFPA';
      END IF;
    ELSE
      NEW.sub_vertical := 'General';
    END IF;
  END IF;

  IF NEW.assigned_team IS NULL OR NEW.assigned_team = '' THEN
    IF NEW.vertical = 'NFPA' THEN NEW.assigned_team := 'NFPA Team';
    ELSIF NEW.vertical = 'Services' THEN NEW.assigned_team := 'Services Team';
    ELSIF NEW.vertical = 'Careers' THEN NEW.assigned_team := 'HR Team';
    ELSIF NEW.vertical = 'Blogs' THEN NEW.assigned_team := 'Content Team';
    ELSE NEW.assigned_team := 'Front Desk Team';
    END IF;
  END IF;

  IF NEW.team_email IS NULL OR NEW.team_email = '' THEN
    IF NEW.vertical = 'NFPA' THEN NEW.team_email := 'nfpa@indusgroup.com';
    ELSIF NEW.vertical = 'Services' THEN NEW.team_email := 'services@indusgroup.com';
    ELSIF NEW.vertical = 'Careers' THEN NEW.team_email := 'careers@indusgroup.com';
    ELSIF NEW.vertical = 'Blogs' THEN NEW.team_email := 'content@indusgroup.com';
    ELSE NEW.team_email := 'enquiries@indusgroup.com';
    END IF;
  END IF;

  IF NEW.status IS NULL OR NEW.status = '' THEN
    NEW.status := 'new';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_services_contact_assign_routing ON services_contact_form;
CREATE TRIGGER trg_services_contact_assign_routing
BEFORE INSERT ON services_contact_form
FOR EACH ROW
EXECUTE FUNCTION assign_enquiry_routing();

DROP TRIGGER IF EXISTS trg_contact_messages_assign_routing ON contact_messages;
CREATE TRIGGER trg_contact_messages_assign_routing
BEFORE INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION assign_enquiry_routing();

-- Queue and log notification tasks whenever a new enquiry arrives
CREATE OR REPLACE FUNCTION queue_enquiry_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  enquiry_key BIGINT;
  body JSONB;
BEGIN
  enquiry_key := NEW.id::BIGINT;
  body := jsonb_build_object(
    'enquiry_table', TG_TABLE_NAME,
    'enquiry_id', enquiry_key,
    'full_name', NEW.full_name,
    'email', NEW.email,
    'phone', NEW.phone,
    'company', coalesce(NEW.company, ''),
    'message', NEW.message,
    'vertical', NEW.vertical,
    'sub_vertical', NEW.sub_vertical,
    'assigned_team', NEW.assigned_team,
    'team_email', NEW.team_email,
    'status', NEW.status,
    'created_at', NEW.created_at
  );

  INSERT INTO notification_logs (
    enquiry_table,
    enquiry_id,
    vertical,
    sub_vertical,
    assigned_team,
    team_email,
    channel,
    status,
    payload
  )
  VALUES (
    TG_TABLE_NAME,
    enquiry_key,
    NEW.vertical,
    NEW.sub_vertical,
    NEW.assigned_team,
    NEW.team_email,
    'email',
    'pending',
    body
  );

  INSERT INTO notification_queue (
    enquiry_table,
    enquiry_id,
    assigned_team,
    team_email,
    payload
  )
  VALUES (
    TG_TABLE_NAME,
    enquiry_key,
    NEW.assigned_team,
    NEW.team_email,
    body
  );

  -- Mark source enquiry as "notified" (queued for delivery)
  NEW.status := 'notified';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_services_contact_queue_notification ON services_contact_form;
CREATE TRIGGER trg_services_contact_queue_notification
BEFORE INSERT ON services_contact_form
FOR EACH ROW
EXECUTE FUNCTION queue_enquiry_notification();

DROP TRIGGER IF EXISTS trg_contact_messages_queue_notification ON contact_messages;
CREATE TRIGGER trg_contact_messages_queue_notification
BEFORE INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION queue_enquiry_notification();

-- Backfill existing rows
UPDATE services_contact_form
SET
  vertical = CASE
    WHEN lower(coalesce(message, '') || ' ' || coalesce(company, '')) LIKE '%nfpa%' THEN 'NFPA'
    WHEN lower(coalesce(message, '') || ' ' || coalesce(company, '')) LIKE '%career%' THEN 'Careers'
    WHEN lower(coalesce(message, '') || ' ' || coalesce(company, '')) LIKE '%blog%' THEN 'Blogs'
    ELSE 'Services'
  END,
  sub_vertical = coalesce(sub_vertical, 'General'),
  assigned_team = coalesce(assigned_team, 'Services Team'),
  team_email = coalesce(team_email, 'services@indusgroup.com'),
  status = coalesce(status, 'new')
WHERE vertical IS NULL
   OR sub_vertical IS NULL
   OR assigned_team IS NULL
   OR team_email IS NULL
   OR status IS NULL;

UPDATE contact_messages
SET
  vertical = CASE
    WHEN lower(coalesce(message, '')) LIKE '%nfpa%' THEN 'NFPA'
    WHEN lower(coalesce(message, '')) LIKE '%career%' THEN 'Careers'
    WHEN lower(coalesce(message, '')) LIKE '%blog%' THEN 'Blogs'
    WHEN lower(coalesce(message, '')) LIKE '%service%' THEN 'Services'
    ELSE 'General'
  END,
  sub_vertical = coalesce(sub_vertical, 'General'),
  assigned_team = CASE
    WHEN coalesce(assigned_team, '') <> '' THEN assigned_team
    WHEN lower(coalesce(message, '')) LIKE '%nfpa%' THEN 'NFPA Team'
    WHEN lower(coalesce(message, '')) LIKE '%career%' THEN 'HR Team'
    WHEN lower(coalesce(message, '')) LIKE '%blog%' THEN 'Content Team'
    WHEN lower(coalesce(message, '')) LIKE '%service%' THEN 'Services Team'
    ELSE 'Front Desk Team'
  END,
  team_email = CASE
    WHEN coalesce(team_email, '') <> '' THEN team_email
    WHEN lower(coalesce(message, '')) LIKE '%nfpa%' THEN 'nfpa@indusgroup.com'
    WHEN lower(coalesce(message, '')) LIKE '%career%' THEN 'careers@indusgroup.com'
    WHEN lower(coalesce(message, '')) LIKE '%blog%' THEN 'content@indusgroup.com'
    WHEN lower(coalesce(message, '')) LIKE '%service%' THEN 'services@indusgroup.com'
    ELSE 'enquiries@indusgroup.com'
  END,
  status = coalesce(status, 'new')
WHERE vertical IS NULL
   OR sub_vertical IS NULL
   OR assigned_team IS NULL
   OR team_email IS NULL
   OR status IS NULL;

-- Enable RLS + permissive policy for new tracking tables (aligned with current project setup)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'notification_logs' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON notification_logs FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'notification_queue' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON notification_queue FOR ALL USING (true);
  END IF;
END $$;
