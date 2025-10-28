# Public Profile URLs Test

This document describes how to test the new public profile URL functionality.

## What Was Implemented

1. **Supabase Storage Setup**: Created a `profile-pictures` bucket with public read access
2. **Image Upload Function**: Created utility functions to upload images and get public URLs
3. **Updated User Creation**: Modified `createAccount` to handle custom image uploads
4. **Updated UI**: Both signup and profile setup screens now support custom image uploads
5. **Public Access**: Profile pictures are stored as public URLs that other users can view

## How to Test

### 1. Test Custom Image Upload
1. Open the app and go through signup or profile setup
2. Select "upload" option for profile picture
3. Choose a custom image from your device
4. Complete the signup/setup process
5. The image should be uploaded to Supabase Storage and stored as a public URL

### 2. Test Public URL Access
1. Create a user with a custom profile picture
2. Join a group with another user
3. In the groups screen, you should see the custom profile picture displayed
4. The ProfilePicture component should load the image from the public URL

### 3. Test Preset vs Custom Images
1. Test with preset emoji avatars (should work as before)
2. Test with custom uploaded images (should upload and store public URLs)
3. Test switching between preset and custom images

## Database Changes

- Added `profile-pictures` storage bucket with public read access
- RLS policies allow users to upload their own images
- Public read access allows other users to view profile pictures

## Files Modified

- `weak-link/supabase/migrations/20250117000000_setup_profile_pictures_storage.sql` - Storage setup
- `weak-link/lib/storage.ts` - Upload utility functions
- `weak-link/contexts/AuthContext.tsx` - Updated createAccount function
- `weak-link/app/(auth)/signup.tsx` - Added custom image upload
- `weak-link/app/(auth)/profile-setup.tsx` - Added custom image upload

## Expected Behavior

- Custom images are uploaded to Supabase Storage
- Public URLs are generated and stored in the database
- Other users can view these images in groups/leaderboards
- Preset emoji avatars continue to work as before
- No breaking changes to existing functionality

