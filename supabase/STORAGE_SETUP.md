# Supabase Storage Bucket Setup

## Required Storage Buckets

For the Home Slider video upload feature to work, you need to create a storage bucket in your Supabase project.

### Create the 'uploads' Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `uploads`
   - **Public bucket**: ✅ **Yes** (check this box to make files publicly accessible)
   - **File size limit**: 100 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty or add `video/*` and `image/*`
5. Click **Create bucket**

### Storage Policies (Required for Upload/Delete)

After creating the bucket, you **must** set up Storage policies to allow uploads, updates, and deletes:

1. Go to **Storage** > **Policies** for the `uploads` bucket
2. Click **New Policy** and create the following policies:

#### Policy 1: Public Read Access
- **Policy Name**: "Public read access"
- **Allowed Operations**: SELECT
- **Policy Definition**: `true` (allow all)
- **Description**: Allows anyone to view/download uploaded files

#### Policy 2: Authenticated Upload
- **Policy Name**: "Authenticated users can upload"
- **Allowed Operations**: INSERT
- **Policy Definition**: `true` (allow authenticated users)
- **Description**: Allows authenticated users to upload files

#### Policy 3: Authenticated Update
- **Policy Name**: "Authenticated users can update"
- **Allowed Operations**: UPDATE
- **Policy Definition**: `true` (allow authenticated users)
- **Description**: Allows authenticated users to update/replace files

#### Policy 4: Authenticated Delete
- **Policy Name**: "Authenticated users can delete"
- **Allowed Operations**: DELETE
- **Policy Definition**: `true` (allow authenticated users)
- **Description**: Allows authenticated users to delete files

### Alternative: Use Existing Bucket

If you already have a storage bucket, you can specify it in the field configuration:

```jsx
{ name: 'video_url', label: 'Video', type: 'video', bucket: 'your-bucket-name' }
```

## Troubleshooting

If you get "Bucket not found" error:
- Verify the bucket name matches exactly (case-sensitive)
- Ensure the bucket is created and visible in Storage
- Check that the bucket is public if you need public URLs
- Verify your Supabase project URL and API keys are correct

