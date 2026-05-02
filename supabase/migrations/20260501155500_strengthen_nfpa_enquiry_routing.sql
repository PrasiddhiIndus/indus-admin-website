/*
  # Strengthen NFPA enquiry auto-routing

  Fixes cases where NFPA form submissions get stored as "General"
  because messages do not explicitly contain "nfpa" but still use
  common NFPA intent terms (batch, course, fees, certification, etc.).
*/

CREATE OR REPLACE FUNCTION apply_nfpa_routing_hint()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  content TEXT;
  current_vertical TEXT;
BEGIN
  content := lower(coalesce(NEW.message, '') || ' ' || coalesce(NEW.company, ''));
  current_vertical := lower(coalesce(NEW.vertical, ''));

  IF current_vertical = '' OR current_vertical = 'general' THEN
    IF content LIKE '%nfpa%'
      OR content LIKE '%batch%'
      OR content LIKE '%course%'
      OR content LIKE '%fire safety%'
      OR content LIKE '%certification%'
      OR content LIKE '%fees%'
      OR content LIKE '%syllabus%'
      OR content LIKE '%exam%'
      OR content LIKE '%admission%'
    THEN
      NEW.vertical := 'NFPA';
      IF coalesce(NEW.sub_vertical, '') = '' OR lower(NEW.sub_vertical) = 'general' THEN
        IF content LIKE '%batch%' THEN NEW.sub_vertical := 'Batches';
        ELSIF content LIKE '%course%' THEN NEW.sub_vertical := 'Courses';
        ELSE NEW.sub_vertical := 'General NFPA';
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_services_contact_nfpa_hint ON services_contact_form;
CREATE TRIGGER trg_services_contact_nfpa_hint
BEFORE INSERT ON services_contact_form
FOR EACH ROW
EXECUTE FUNCTION apply_nfpa_routing_hint();

DROP TRIGGER IF EXISTS trg_contact_messages_nfpa_hint ON contact_messages;
CREATE TRIGGER trg_contact_messages_nfpa_hint
BEFORE INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION apply_nfpa_routing_hint();

-- Backfill rows that should be NFPA but were tagged as General.
UPDATE contact_messages
SET
  vertical = 'NFPA',
  sub_vertical = CASE
    WHEN lower(coalesce(message, '')) LIKE '%batch%' THEN 'Batches'
    WHEN lower(coalesce(message, '')) LIKE '%course%' THEN 'Courses'
    ELSE coalesce(NULLIF(sub_vertical, ''), 'General NFPA')
  END
WHERE lower(coalesce(vertical, 'general')) = 'general'
  AND (
    lower(coalesce(message, '')) LIKE '%nfpa%'
    OR lower(coalesce(message, '')) LIKE '%batch%'
    OR lower(coalesce(message, '')) LIKE '%course%'
    OR lower(coalesce(message, '')) LIKE '%fire safety%'
    OR lower(coalesce(message, '')) LIKE '%certification%'
    OR lower(coalesce(message, '')) LIKE '%fees%'
    OR lower(coalesce(message, '')) LIKE '%syllabus%'
    OR lower(coalesce(message, '')) LIKE '%exam%'
    OR lower(coalesce(message, '')) LIKE '%admission%'
    OR lower(coalesce(assigned_team, '')) LIKE '%nfpa%'
    OR lower(coalesce(team_email, '')) LIKE '%nfpa%'
  );

UPDATE services_contact_form
SET
  vertical = 'NFPA',
  sub_vertical = CASE
    WHEN lower(coalesce(message, '')) LIKE '%batch%' THEN 'Batches'
    WHEN lower(coalesce(message, '')) LIKE '%course%' THEN 'Courses'
    ELSE coalesce(NULLIF(sub_vertical, ''), 'General NFPA')
  END
WHERE lower(coalesce(vertical, 'general')) = 'general'
  AND (
    lower(coalesce(message, '')) LIKE '%nfpa%'
    OR lower(coalesce(message, '')) LIKE '%batch%'
    OR lower(coalesce(message, '')) LIKE '%course%'
    OR lower(coalesce(message, '')) LIKE '%fire safety%'
    OR lower(coalesce(message, '')) LIKE '%certification%'
    OR lower(coalesce(message, '')) LIKE '%fees%'
    OR lower(coalesce(message, '')) LIKE '%syllabus%'
    OR lower(coalesce(message, '')) LIKE '%exam%'
    OR lower(coalesce(message, '')) LIKE '%admission%'
    OR lower(coalesce(assigned_team, '')) LIKE '%nfpa%'
    OR lower(coalesce(team_email, '')) LIKE '%nfpa%'
  );
