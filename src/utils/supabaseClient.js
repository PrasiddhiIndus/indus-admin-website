import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadFile = async (bucket, fileName, file) => {
  const filePath = `uploads/${fileName}`;
  
  // Try to upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error);
    
    // Provide helpful error message for bucket not found
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        `Storage bucket "${bucket}" does not exist. ` +
        `Please create it in your Supabase dashboard: ` +
        `Go to Storage > Create new bucket > Name: "${bucket}" > Make it Public > Create bucket`
      );
    }
    
    throw error;
  }

  return data;
};

export const getFileUrl = (bucket, fileName) => {
  const filePath = `uploads/${fileName}`;
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};
