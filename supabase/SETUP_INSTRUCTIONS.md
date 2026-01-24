# Quick Setup Instructions for Home Slider Video Upload

Follow these steps to set up the Supabase schema and storage for video uploads:

## Step 1: Run Database Migrations

### Option A: Using Supabase Dashboard (Easiest)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open and run: `supabase/migrations/20250101000000_fix_slider_section_schema.sql`
4. This will:
   - Add `updated_at` column
   - Create proper indexes
   - Set up RLS policies for CRUD operations

### Option B: Using Supabase CLI
```bash
supabase db push
```

## Step 2: Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Configure:
   - **Name**: `uploads`
   - **Public bucket**: ✅ **Yes** (required for public video URLs)
   - **File size limit**: 100 MB (or your preference)
   - **Allowed MIME types**: `video/*` (optional)
4. Click **Create bucket**

## Step 3: Set Up Storage Policies

After creating the bucket, set up policies:

1. Go to **Storage** > **Policies** for `uploads` bucket
2. Create these 4 policies:

### Policy 1: Public Read
- **Name**: "Public read access"
- **Operation**: SELECT
- **Definition**: `true`

### Policy 2: Authenticated Upload
- **Name**: "Authenticated users can upload"
- **Operation**: INSERT
- **Definition**: `true`

### Policy 3: Authenticated Update
- **Name**: "Authenticated users can update"
- **Operation**: UPDATE
- **Definition**: `true`

### Policy 4: Authenticated Delete
- **Name**: "Authenticated users can delete"
- **Operation**: DELETE
- **Definition**: `true`

## Step 4: Verify Setup

1. Check that `slider_section` table exists with all columns
2. Verify `uploads` bucket is created and public
3. Test video upload in the admin panel

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `uploads` (case-sensitive)
- Verify the bucket is created in Storage

### "Permission denied" error
- Check that storage policies are set up correctly
- Ensure the bucket is marked as public

### Migration errors
- Check SQL Editor for specific error messages
- Some columns may already exist (this is okay)

## What This Enables

✅ **Create**: Upload new videos to slider
✅ **Read**: View all slider entries with videos
✅ **Update**: Replace or edit existing videos
✅ **Delete**: Remove slider entries and videos

All operations are now properly configured in Supabase!

