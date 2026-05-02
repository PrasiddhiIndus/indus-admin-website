/*
  # Fix enquiry table visibility in admin

  Ensures both enquiry source tables are readable/writeable by the current
  anon-key based admin app setup.
*/

ALTER TABLE IF EXISTS services_contact_form ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'services_contact_form'
      AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations"
      ON services_contact_form
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contact_messages'
      AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations"
      ON contact_messages
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
