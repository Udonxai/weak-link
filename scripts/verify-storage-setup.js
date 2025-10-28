/**
 * Script to verify Supabase Storage setup for profile pictures
 * Run this with: node scripts/verify-storage-setup.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorageSetup() {
  console.log('🔍 Verifying Supabase Storage setup...\n');

  try {
    // Check if the profile-pictures bucket exists
    console.log('1. Checking if profile-pictures bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    const profilePicturesBucket = buckets.find(bucket => bucket.name === 'profile-pictures');
    
    if (!profilePicturesBucket) {
      console.error('❌ profile-pictures bucket not found!');
      console.log('Please create the bucket manually in your Supabase dashboard or run the migration.');
      return;
    }

    console.log('✅ profile-pictures bucket exists');
    console.log('   - Public:', profilePicturesBucket.public);
    console.log('   - File size limit:', profilePicturesBucket.file_size_limit);
    console.log('   - Allowed MIME types:', profilePicturesBucket.allowed_mime_types);

    // Test upload permissions
    console.log('\n2. Testing upload permissions...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file for profile pictures bucket';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(`test-user/${testFileName}`, testContent, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      return;
    }

    console.log('✅ Upload test successful');

    // Test public URL access
    console.log('\n3. Testing public URL access...');
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(uploadData.path);

    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Clean up test file
    console.log('\n4. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('profile-pictures')
      .remove([uploadData.path]);

    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Storage setup verification complete!');
    console.log('Your profile pictures feature should work correctly.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyStorageSetup();
