/*
  # Storage Bucket Policies for uploads bucket
  
  This migration sets up storage policies for the 'uploads' bucket.
  Note: The bucket itself must be created manually in the Supabase Dashboard.
  
  Storage policies are managed through the Supabase Dashboard, but this file
  documents the recommended policies.
  
  To apply these policies:
  1. Go to Supabase Dashboard > Storage > uploads bucket > Policies
  2. Create the following policies manually
*/

/*
  RECOMMENDED STORAGE POLICIES FOR 'uploads' BUCKET:
  
  1. Public Read Policy (for public access to uploaded files):
     - Policy Name: "Public read access"
     - Allowed Operations: SELECT
     - Policy Definition: true (allow all)
  
  2. Authenticated Upload Policy:
     - Policy Name: "Authenticated users can upload"
     - Allowed Operations: INSERT
     - Policy Definition: true (allow authenticated users)
  
  3. Authenticated Update Policy:
     - Policy Name: "Authenticated users can update"
     - Allowed Operations: UPDATE
     - Policy Definition: true (allow authenticated users)
  
  4. Authenticated Delete Policy:
     - Policy Name: "Authenticated users can delete"
     - Allowed Operations: DELETE
     - Policy Definition: true (allow authenticated users)
  
  ALTERNATIVE: If you want to use service role key for uploads (more secure):
  - Use the service role key in your backend/API
  - Keep bucket private
  - Generate signed URLs for public access
*/

-- Note: Storage policies cannot be created via SQL migrations
-- They must be created through the Supabase Dashboard or API
-- This file serves as documentation only

