# Setup Profile Pictures Storage Bucket

The error "Bucket not found" indicates that the `profile-pictures` storage bucket hasn't been created yet. Here are the steps to fix this:

## Option 1: Run the Migration (Recommended)

If you have Supabase CLI set up and connected to your remote project:

```bash
# Apply the migration to your remote Supabase project
npx supabase db push
```

## Option 2: Manual Setup via Supabase Dashboard

If you don't have Supabase CLI set up, you can create the bucket manually:

### 1. Go to Supabase Dashboard
- Open your Supabase project dashboard
- Navigate to **Storage** in the left sidebar

### 2. Create the Bucket
- Click **"New bucket"**
- Name: `profile-pictures`
- **Important**: Check **"Public bucket"** to make it publicly accessible
- Click **"Create bucket"**

### 3. Set Up RLS Policies
Go to **Authentication > Policies** and add these policies for the `storage.objects` table:

#### Policy 1: Users can upload their own profile pictures
```sql
CREATE POLICY "Users can upload their own profile pictures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 2: Users can update their own profile pictures
```sql
CREATE POLICY "Users can update their own profile pictures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 3: Users can delete their own profile pictures
```sql
CREATE POLICY "Users can delete their own profile pictures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 4: Profile pictures are publicly readable
```sql
CREATE POLICY "Profile pictures are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');
```

### 4. Configure Bucket Settings
- Go to **Storage > Settings**
- Find the `profile-pictures` bucket
- Set **File size limit**: 5MB
- Set **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`

## Option 3: Use Supabase CLI (If Available)

If you have Supabase CLI installed and your project is linked:

```bash
# Start Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Stop when done
npx supabase stop
```

## Verification

After setting up the bucket, test the upload functionality:

1. Try uploading a custom profile picture during signup
2. Check the Supabase Storage dashboard to see if the file was uploaded
3. Verify that the public URL works by opening it in a browser

## Troubleshooting

If you still get errors:
1. Make sure the bucket is set to **public**
2. Verify the RLS policies are correctly applied
3. Check that your Supabase project URL and keys are correct in your environment variables
