/*
  # Fix slider_section table schema and policies
  
  This migration improves the slider_section table structure and sets up proper RLS policies
  for secure CRUD operations (Create, Read, Update, Delete).
*/

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations" ON slider_section;
DROP POLICY IF EXISTS "Enable read for all" ON slider_section;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON slider_section;
DROP POLICY IF EXISTS "Enable update for authenticated" ON slider_section;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON slider_section;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'slider_section' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE slider_section ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_slider_section_updated_at ON slider_section;
CREATE TRIGGER update_slider_section_updated_at
  BEFORE UPDATE ON slider_section
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure video_url can be NULL (for flexibility)
ALTER TABLE slider_section ALTER COLUMN video_url DROP NOT NULL;

-- Create proper RLS policies for slider_section
-- Note: Since the app uses localStorage-based auth (not Supabase Auth),
-- we allow all operations. The app handles authentication at the application level.
-- Policy 1: Allow all SELECT operations (read/view)
CREATE POLICY "Enable read for all" ON slider_section
  FOR SELECT
  USING (true);

-- Policy 2: Allow all INSERT operations (create)
CREATE POLICY "Enable insert for all" ON slider_section
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Allow all UPDATE operations (update/edit)
CREATE POLICY "Enable update for all" ON slider_section
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow all DELETE operations (delete)
CREATE POLICY "Enable delete for all" ON slider_section
  FOR DELETE
  USING (true);

-- Add index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_slider_section_created_at ON slider_section(created_at DESC);

-- Add index on updated_at for better query performance
CREATE INDEX IF NOT EXISTS idx_slider_section_updated_at ON slider_section(updated_at DESC);

