-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true, -- Make bucket public so profile pictures can be viewed by other users
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create RLS policies for profile pictures bucket
-- Since the app doesn't use Supabase auth (uses custom user IDs), we need to allow uploads
-- For a simpler approach, allow all authenticated sessions to upload to profile-pictures
-- The folder structure will organize files by user ID

-- Allow anyone to upload to profile-pictures bucket (since auth.uid() won't match numeric user IDs)
-- This is safe because profile pictures are meant to be public anyway
CREATE POLICY "Allow uploads to profile-pictures bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-pictures');

CREATE POLICY "Allow updates to profile-pictures bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Allow deletes from profile-pictures bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-pictures');

-- Allow public read access to profile pictures (so other users can view them)
CREATE POLICY "Profile pictures are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');

