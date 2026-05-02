# Supabase Database Setup

This directory contains migrations and setup instructions for the INDUS Admin Panel database.

## Migration Files

### 1. `20250728042154_restless_disk.sql`
Initial database schema with all tables and basic RLS setup.

### 2. `20250101000000_fix_slider_section_schema.sql`
Improves the `slider_section` table with:
- `updated_at` column with auto-update trigger
- Proper indexes for performance
- Comprehensive RLS policies for CRUD operations
- Better schema structure

### 3. `20250101000001_storage_policies.sql`
Documentation for storage bucket policies (must be set up manually in Supabase Dashboard).

### 4. `20260420145500_enquiry_routing_and_notifications.sql`
Adds enquiry routing + notification baseline:
- New enquiry metadata columns on `services_contact_form` and `contact_messages`:
  - `vertical`
  - `sub_vertical`
  - `assigned_team`
  - `team_email`
  - `status` (`new`, `notified`, `in_progress`, `closed`)
- Auto-routing triggers that infer team ownership for new enquiries
- `notification_logs` table for notification audit trails
- `notification_queue` table for downstream email/Slack worker processing

## Edge Functions

### `notify-enquiry-teams`
Location: `supabase/functions/notify-enquiry-teams`

Purpose:
- Processes pending rows in `notification_queue`
- Sends team alerts via Slack webhook and/or Resend email
- Marks queue entries as processed
- Updates `notification_logs` with delivery status

See function-specific setup in:
- `supabase/functions/notify-enquiry-teams/README.md`

## Running Migrations

### Option 1: Supabase CLI (Recommended)
```bash
# Make sure you have Supabase CLI installed
supabase db push

# Or apply specific migration
supabase migration up
```

### Option 2: Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the migration SQL
4. Run the query

### Option 3: Direct SQL Execution
Run the migration files in order using your preferred PostgreSQL client.

## Table Schema: slider_section

The `slider_section` table stores home page slider content with video uploads.

### Columns:
- `id` (SERIAL PRIMARY KEY) - Auto-incrementing unique identifier
- `title` (TEXT NOT NULL) - Slider title
- `description` (TEXT) - Optional description
- `video_url` (TEXT) - Video file URL (from Supabase Storage or external URL)
- `created_at` (TIMESTAMPTZ) - Auto-set on creation
- `updated_at` (TIMESTAMPTZ) - Auto-updated on modification

### Indexes:
- `idx_slider_section_created_at` - For sorting by creation date
- `idx_slider_section_updated_at` - For sorting by update date

### RLS Policies:
- **Enable read for all**: Allows anyone to read/view slider content
- **Enable insert for all**: Allows creating new slider entries
- **Enable update for all**: Allows updating existing entries
- **Enable delete for all**: Allows deleting entries

## Storage Setup

See `STORAGE_SETUP.md` for detailed instructions on setting up the `uploads` storage bucket for video uploads.

## Important Notes

1. **Authentication**: This app uses localStorage-based authentication, not Supabase Auth. Therefore, RLS policies allow all operations. Security is handled at the application level.

2. **Storage Bucket**: The `uploads` bucket must be created manually in the Supabase Dashboard before video uploads will work.

3. **Migrations Order**: Run migrations in chronological order (by filename timestamp).

4. **Backup**: Always backup your database before running migrations in production.

5. **Notification Delivery**: This project now queues notification jobs in `notification_queue`. To send real emails/Slack alerts, run a worker (Supabase Edge Function, cron job, or backend service) that reads unprocessed queue entries and marks them processed.

## Troubleshooting

### "Bucket not found" error
- Create the `uploads` bucket in Supabase Dashboard > Storage
- See `STORAGE_SETUP.md` for detailed instructions

### RLS policy errors
- Policies are created with `IF NOT EXISTS` where possible
- If you get duplicate policy errors, the migration will drop and recreate them

### Migration conflicts
- If a migration fails, check the error message
- Some migrations use `IF NOT EXISTS` to avoid conflicts
- You may need to manually adjust if the schema has been modified

