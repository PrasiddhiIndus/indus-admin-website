/*
  # Dedicated NFPA enquiry hit table

  Creates a single table that stores NFPA enquiry/API hits and keeps it
  automatically populated from existing enquiry tables.
*/

CREATE TABLE IF NOT EXISTS nfpa_enquiry_hits (
  id BIGSERIAL PRIMARY KEY,
  source_table TEXT NOT NULL,
  source_id BIGINT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  message TEXT,
  page TEXT,
  path TEXT,
  url TEXT,
  api_endpoint TEXT,
  enquiry_type TEXT,
  service_type TEXT,
  category TEXT,
  subject TEXT,
  vertical TEXT NOT NULL DEFAULT 'NFPA',
  sub_vertical TEXT DEFAULT 'General NFPA',
  status TEXT NOT NULL DEFAULT 'new',
  request_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_table, source_id)
);

CREATE INDEX IF NOT EXISTS idx_nfpa_enquiry_hits_created_at
  ON nfpa_enquiry_hits (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nfpa_enquiry_hits_vertical
  ON nfpa_enquiry_hits (vertical, sub_vertical);

ALTER TABLE nfpa_enquiry_hits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'nfpa_enquiry_hits'
      AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations"
      ON nfpa_enquiry_hits
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_nfpa_enquiry_hits_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nfpa_enquiry_hits_set_updated_at ON nfpa_enquiry_hits;
CREATE TRIGGER trg_nfpa_enquiry_hits_set_updated_at
BEFORE UPDATE ON nfpa_enquiry_hits
FOR EACH ROW
EXECUTE FUNCTION set_nfpa_enquiry_hits_updated_at();

CREATE OR REPLACE FUNCTION capture_nfpa_enquiry_hit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  payload JSONB;
  content TEXT;
  normalized_vertical TEXT;
  inferred_sub_vertical TEXT;
BEGIN
  payload := to_jsonb(NEW);

  content := lower(
    coalesce(payload->>'message', '') || ' ' ||
    coalesce(payload->>'company', '') || ' ' ||
    coalesce(payload->>'page', '') || ' ' ||
    coalesce(payload->>'path', '') || ' ' ||
    coalesce(payload->>'url', '') || ' ' ||
    coalesce(payload->>'subject', '') || ' ' ||
    coalesce(payload->>'enquiry_type', '') || ' ' ||
    coalesce(payload->>'category', '') || ' ' ||
    coalesce(payload->>'assigned_team', '') || ' ' ||
    coalesce(payload->>'team_email', '')
  );

  normalized_vertical := lower(coalesce(payload->>'vertical', ''));

  IF normalized_vertical = 'nfpa'
    OR content LIKE '%nfpa%'
    OR content LIKE '%batch%'
    OR content LIKE '%course%'
    OR content LIKE '%fire safety%'
    OR content LIKE '%certification%'
    OR content LIKE '%fees%'
    OR content LIKE '%syllabus%'
    OR content LIKE '%exam%'
    OR content LIKE '%admission%'
  THEN
    inferred_sub_vertical := CASE
      WHEN content LIKE '%batch%' THEN 'Batches'
      WHEN content LIKE '%course%' THEN 'Courses'
      ELSE 'General NFPA'
    END;

    INSERT INTO nfpa_enquiry_hits (
      source_table,
      source_id,
      full_name,
      email,
      phone,
      company,
      message,
      page,
      path,
      url,
      api_endpoint,
      enquiry_type,
      service_type,
      category,
      subject,
      vertical,
      sub_vertical,
      status,
      request_payload,
      created_at
    )
    VALUES (
      TG_TABLE_NAME,
      NEW.id::BIGINT,
      payload->>'full_name',
      payload->>'email',
      payload->>'phone',
      payload->>'company',
      payload->>'message',
      payload->>'page',
      payload->>'path',
      payload->>'url',
      payload->>'api_endpoint',
      payload->>'enquiry_type',
      payload->>'service_type',
      payload->>'category',
      payload->>'subject',
      'NFPA',
      coalesce(NULLIF(payload->>'sub_vertical', ''), inferred_sub_vertical),
      coalesce(NULLIF(payload->>'status', ''), 'new'),
      payload,
      coalesce((payload->>'created_at')::timestamptz, now())
    )
    ON CONFLICT (source_table, source_id)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      company = EXCLUDED.company,
      message = EXCLUDED.message,
      page = EXCLUDED.page,
      path = EXCLUDED.path,
      url = EXCLUDED.url,
      api_endpoint = EXCLUDED.api_endpoint,
      enquiry_type = EXCLUDED.enquiry_type,
      service_type = EXCLUDED.service_type,
      category = EXCLUDED.category,
      subject = EXCLUDED.subject,
      vertical = EXCLUDED.vertical,
      sub_vertical = EXCLUDED.sub_vertical,
      status = EXCLUDED.status,
      request_payload = EXCLUDED.request_payload,
      created_at = EXCLUDED.created_at,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_capture_nfpa_hit_from_contact_messages ON contact_messages;
CREATE TRIGGER trg_capture_nfpa_hit_from_contact_messages
AFTER INSERT OR UPDATE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION capture_nfpa_enquiry_hit();

DROP TRIGGER IF EXISTS trg_capture_nfpa_hit_from_services_contact_form ON services_contact_form;
CREATE TRIGGER trg_capture_nfpa_hit_from_services_contact_form
AFTER INSERT OR UPDATE ON services_contact_form
FOR EACH ROW
EXECUTE FUNCTION capture_nfpa_enquiry_hit();

CREATE OR REPLACE FUNCTION capture_nfpa_hit_from_notification_log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  payload JSONB;
  content TEXT;
  inferred_sub_vertical TEXT;
BEGIN
  payload := coalesce(NEW.payload, '{}'::jsonb);
  content := lower(
    coalesce(payload->>'message', '') || ' ' ||
    coalesce(payload->>'company', '') || ' ' ||
    coalesce(payload->>'vertical', '') || ' ' ||
    coalesce(payload->>'sub_vertical', '') || ' ' ||
    coalesce(payload->>'assigned_team', '') || ' ' ||
    coalesce(payload->>'team_email', '')
  );

  IF lower(coalesce(NEW.vertical, '')) = 'nfpa'
    OR lower(coalesce(payload->>'vertical', '')) = 'nfpa'
    OR content LIKE '%nfpa%'
    OR content LIKE '%batch%'
    OR content LIKE '%course%'
    OR content LIKE '%fire safety%'
    OR content LIKE '%certification%'
  THEN
    inferred_sub_vertical := CASE
      WHEN content LIKE '%batch%' THEN 'Batches'
      WHEN content LIKE '%course%' THEN 'Courses'
      ELSE 'General NFPA'
    END;

    INSERT INTO nfpa_enquiry_hits (
      source_table,
      source_id,
      full_name,
      email,
      phone,
      company,
      message,
      page,
      path,
      url,
      api_endpoint,
      enquiry_type,
      service_type,
      category,
      subject,
      vertical,
      sub_vertical,
      status,
      request_payload,
      created_at
    )
    VALUES (
      coalesce(NEW.enquiry_table, payload->>'enquiry_table', 'notification_logs'),
      coalesce(NEW.enquiry_id, NEW.id)::BIGINT,
      payload->>'full_name',
      payload->>'email',
      payload->>'phone',
      payload->>'company',
      payload->>'message',
      payload->>'page',
      payload->>'path',
      payload->>'url',
      payload->>'api_endpoint',
      payload->>'enquiry_type',
      payload->>'service_type',
      payload->>'category',
      payload->>'subject',
      'NFPA',
      coalesce(NULLIF(payload->>'sub_vertical', ''), inferred_sub_vertical),
      coalesce(NULLIF(payload->>'status', ''), 'notified'),
      payload,
      coalesce((payload->>'created_at')::timestamptz, NEW.created_at, now())
    )
    ON CONFLICT (source_table, source_id)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      company = EXCLUDED.company,
      message = EXCLUDED.message,
      page = EXCLUDED.page,
      path = EXCLUDED.path,
      url = EXCLUDED.url,
      api_endpoint = EXCLUDED.api_endpoint,
      enquiry_type = EXCLUDED.enquiry_type,
      service_type = EXCLUDED.service_type,
      category = EXCLUDED.category,
      subject = EXCLUDED.subject,
      vertical = EXCLUDED.vertical,
      sub_vertical = EXCLUDED.sub_vertical,
      status = EXCLUDED.status,
      request_payload = EXCLUDED.request_payload,
      created_at = EXCLUDED.created_at,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_capture_nfpa_hit_from_notification_logs ON notification_logs;
CREATE TRIGGER trg_capture_nfpa_hit_from_notification_logs
AFTER INSERT OR UPDATE ON notification_logs
FOR EACH ROW
EXECUTE FUNCTION capture_nfpa_hit_from_notification_log();

CREATE OR REPLACE FUNCTION ingest_nfpa_enquiry_hit(hit JSONB)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id BIGINT;
BEGIN
  INSERT INTO nfpa_enquiry_hits (
    source_table,
    source_id,
    full_name,
    email,
    phone,
    company,
    message,
    page,
    path,
    url,
    api_endpoint,
    enquiry_type,
    service_type,
    category,
    subject,
    vertical,
    sub_vertical,
    status,
    request_payload,
    created_at
  )
  VALUES (
    coalesce(hit->>'source_table', 'nfpa_page_api'),
    coalesce((hit->>'source_id')::bigint, extract(epoch from now())::bigint),
    hit->>'full_name',
    hit->>'email',
    hit->>'phone',
    hit->>'company',
    hit->>'message',
    hit->>'page',
    hit->>'path',
    hit->>'url',
    hit->>'api_endpoint',
    hit->>'enquiry_type',
    hit->>'service_type',
    hit->>'category',
    hit->>'subject',
    'NFPA',
    coalesce(NULLIF(hit->>'sub_vertical', ''), 'General NFPA'),
    coalesce(NULLIF(hit->>'status', ''), 'new'),
    hit,
    coalesce((hit->>'created_at')::timestamptz, now())
  )
  ON CONFLICT (source_table, source_id)
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    message = EXCLUDED.message,
    page = EXCLUDED.page,
    path = EXCLUDED.path,
    url = EXCLUDED.url,
    api_endpoint = EXCLUDED.api_endpoint,
    enquiry_type = EXCLUDED.enquiry_type,
    service_type = EXCLUDED.service_type,
    category = EXCLUDED.category,
    subject = EXCLUDED.subject,
    vertical = EXCLUDED.vertical,
    sub_vertical = EXCLUDED.sub_vertical,
    status = EXCLUDED.status,
    request_payload = EXCLUDED.request_payload,
    created_at = EXCLUDED.created_at,
    updated_at = now()
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION ingest_nfpa_enquiry_hit(JSONB) TO anon, authenticated;

-- Backfill historical rows that should be visible in NFPA enquiries.
INSERT INTO nfpa_enquiry_hits (
  source_table,
  source_id,
  full_name,
  email,
  phone,
  company,
  message,
  page,
  path,
  url,
  api_endpoint,
  enquiry_type,
  service_type,
  category,
  subject,
  vertical,
  sub_vertical,
  status,
  request_payload,
  created_at
)
SELECT
  'contact_messages',
  c.id::BIGINT,
  c.full_name,
  c.email,
  c.phone,
  to_jsonb(c)->>'company',
  c.message,
  to_jsonb(c)->>'page',
  to_jsonb(c)->>'path',
  to_jsonb(c)->>'url',
  to_jsonb(c)->>'api_endpoint',
  to_jsonb(c)->>'enquiry_type',
  to_jsonb(c)->>'service_type',
  to_jsonb(c)->>'category',
  to_jsonb(c)->>'subject',
  'NFPA',
  CASE
    WHEN lower(coalesce(c.message, '')) LIKE '%batch%' THEN 'Batches'
    WHEN lower(coalesce(c.message, '')) LIKE '%course%' THEN 'Courses'
    ELSE coalesce(NULLIF(to_jsonb(c)->>'sub_vertical', ''), 'General NFPA')
  END,
  coalesce(NULLIF(to_jsonb(c)->>'status', ''), 'new'),
  to_jsonb(c),
  coalesce((to_jsonb(c)->>'created_at')::timestamptz, now())
FROM contact_messages c
WHERE lower(coalesce(to_jsonb(c)->>'vertical', '')) = 'nfpa'
   OR lower(coalesce(c.message, '')) LIKE '%nfpa%'
   OR lower(coalesce(c.message, '')) LIKE '%batch%'
   OR lower(coalesce(c.message, '')) LIKE '%course%'
   OR lower(coalesce(to_jsonb(c)->>'team_email', '')) LIKE '%nfpa%'
   OR lower(coalesce(to_jsonb(c)->>'assigned_team', '')) LIKE '%nfpa%'
ON CONFLICT (source_table, source_id) DO NOTHING;

INSERT INTO nfpa_enquiry_hits (
  source_table,
  source_id,
  full_name,
  email,
  phone,
  company,
  message,
  page,
  path,
  url,
  api_endpoint,
  enquiry_type,
  service_type,
  category,
  subject,
  vertical,
  sub_vertical,
  status,
  request_payload,
  created_at
)
SELECT
  'services_contact_form',
  s.id::BIGINT,
  s.full_name,
  s.email,
  s.phone,
  s.company,
  s.message,
  to_jsonb(s)->>'page',
  to_jsonb(s)->>'path',
  to_jsonb(s)->>'url',
  to_jsonb(s)->>'api_endpoint',
  to_jsonb(s)->>'enquiry_type',
  to_jsonb(s)->>'service_type',
  to_jsonb(s)->>'category',
  to_jsonb(s)->>'subject',
  'NFPA',
  CASE
    WHEN lower(coalesce(s.message, '')) LIKE '%batch%' THEN 'Batches'
    WHEN lower(coalesce(s.message, '')) LIKE '%course%' THEN 'Courses'
    ELSE coalesce(NULLIF(to_jsonb(s)->>'sub_vertical', ''), 'General NFPA')
  END,
  coalesce(NULLIF(to_jsonb(s)->>'status', ''), 'new'),
  to_jsonb(s),
  coalesce((to_jsonb(s)->>'created_at')::timestamptz, now())
FROM services_contact_form s
WHERE lower(coalesce(to_jsonb(s)->>'vertical', '')) = 'nfpa'
   OR lower(coalesce(s.message, '')) LIKE '%nfpa%'
   OR lower(coalesce(s.message, '')) LIKE '%batch%'
   OR lower(coalesce(s.message, '')) LIKE '%course%'
   OR lower(coalesce(to_jsonb(s)->>'team_email', '')) LIKE '%nfpa%'
   OR lower(coalesce(to_jsonb(s)->>'assigned_team', '')) LIKE '%nfpa%'
ON CONFLICT (source_table, source_id) DO NOTHING;

INSERT INTO nfpa_enquiry_hits (
  source_table,
  source_id,
  full_name,
  email,
  phone,
  company,
  message,
  page,
  path,
  url,
  api_endpoint,
  enquiry_type,
  service_type,
  category,
  subject,
  vertical,
  sub_vertical,
  status,
  request_payload,
  created_at
)
SELECT
  coalesce(n.enquiry_table, p->>'enquiry_table', 'notification_logs'),
  coalesce(n.enquiry_id, n.id)::BIGINT,
  p->>'full_name',
  p->>'email',
  p->>'phone',
  p->>'company',
  p->>'message',
  p->>'page',
  p->>'path',
  p->>'url',
  p->>'api_endpoint',
  p->>'enquiry_type',
  p->>'service_type',
  p->>'category',
  p->>'subject',
  'NFPA',
  CASE
    WHEN lower(coalesce(p->>'message', '')) LIKE '%batch%' THEN 'Batches'
    WHEN lower(coalesce(p->>'message', '')) LIKE '%course%' THEN 'Courses'
    ELSE coalesce(NULLIF(p->>'sub_vertical', ''), 'General NFPA')
  END,
  coalesce(NULLIF(p->>'status', ''), n.status, 'notified'),
  p,
  coalesce((p->>'created_at')::timestamptz, n.created_at, now())
FROM notification_logs n
CROSS JOIN LATERAL coalesce(n.payload, '{}'::jsonb) p
WHERE lower(coalesce(n.vertical, '')) = 'nfpa'
   OR lower(coalesce(p->>'vertical', '')) = 'nfpa'
   OR lower(coalesce(p->>'message', '')) LIKE '%nfpa%'
   OR lower(coalesce(p->>'message', '')) LIKE '%batch%'
   OR lower(coalesce(p->>'message', '')) LIKE '%course%'
   OR lower(coalesce(p->>'team_email', '')) LIKE '%nfpa%'
   OR lower(coalesce(p->>'assigned_team', '')) LIKE '%nfpa%'
ON CONFLICT (source_table, source_id) DO NOTHING;
