import { supabase } from './supabase';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param fileUri - Local file URI (from ImagePicker)
 * @param userId - User ID to organize files by user
 * @param fileName - Optional custom filename (defaults to timestamp)
 * @returns Promise<string> - Public URL of the uploaded image
 */
export async function uploadProfilePicture(
  fileUri: string,
  userId: number,
  fileName?: string
): Promise<string> {
  try {
    console.log('Starting upload for file:', fileUri, 'userId:', userId);
    
    // Generate filename if not provided
    const finalFileName = fileName || `profile_${Date.now()}.jpg`;
    
    // For React Native, we need to use fetch to read the file and convert it to a blob-like object
    console.log('Fetching file from URI...');
    const response = await fetch(fileUri);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.status} ${response.statusText}`);
    }
    
    console.log('Converting to array buffer...');
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Array buffer size:', arrayBuffer.byteLength);
    
    // Upload to Supabase Storage
    console.log('Uploading to Supabase Storage...');
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(`${userId}/${finalFileName}`, uint8Array, {
        cacheControl: '3600',
        upsert: true, // Replace existing file with same name
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error('Error uploading profile picture:', error);
      
      // Check if it's a bucket not found error
      if (error.message.includes('Bucket not found') || error.message.includes('404')) {
        throw new Error('Storage bucket not found. Please set up the profile-pictures bucket in your Supabase dashboard. See SETUP_STORAGE_BUCKET.md for instructions.');
      }
      
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    console.log('Upload successful, getting public URL...');
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(data.path);

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    throw new Error('Failed to upload profile picture');
  }
}

/**
 * Alternative upload method using FormData (fallback approach)
 * @param fileUri - Local file URI (from ImagePicker)
 * @param userId - User ID to organize files by user
 * @param fileName - Optional custom filename (defaults to timestamp)
 * @returns Promise<string> - Public URL of the uploaded image
 */
export async function uploadProfilePictureFormData(
  fileUri: string,
  userId: number,
  fileName?: string
): Promise<string> {
  try {
    console.log('Using FormData approach for file:', fileUri);
    
    // Generate filename if not provided
    const finalFileName = fileName || `profile_${Date.now()}.jpg`;
    
    // Create FormData for React Native
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: finalFileName,
    } as any);
    
    // Use direct fetch to Supabase Storage API
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
    
    const uploadUrl = `${supabaseUrl}/storage/v1/object/profile-pictures/${userId}/${finalFileName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a bucket not found error
      if (response.status === 404 && errorText.includes('Bucket not found')) {
        throw new Error('Storage bucket not found. Please set up the profile-pictures bucket in your Supabase dashboard. See SETUP_STORAGE_BUCKET.md for instructions.');
      }
      
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    // Get the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-pictures/${userId}/${finalFileName}`;
    console.log('Public URL generated:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProfilePictureFormData:', error);
    throw new Error('Failed to upload profile picture');
  }
}

/**
 * Deletes a profile picture from Supabase Storage
 * @param userId - User ID
 * @param fileName - Name of the file to delete
 */
export async function deleteProfilePicture(userId: number, fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([`${userId}/${fileName}`]);

    if (error) {
      console.error('Error deleting profile picture:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteProfilePicture:', error);
    throw new Error('Failed to delete profile picture');
  }
}

/**
 * Gets the public URL for a profile picture
 * @param userId - User ID
 * @param fileName - Name of the file
 * @returns Public URL string
 */
export function getProfilePictureUrl(userId: number, fileName: string): string {
  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(`${userId}/${fileName}`);
  
  return data.publicUrl;
}

