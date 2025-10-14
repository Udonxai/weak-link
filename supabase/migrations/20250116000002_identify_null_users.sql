-- Query to identify users with NULL or empty profile_name
-- Run this first to see what needs to be cleaned up

-- Show all users with NULL or empty profile_name
SELECT 
  id,
  profile_name,
  real_name,
  profile_pic_url,
  created_at
FROM users 
WHERE profile_name IS NULL 
   OR profile_name = '' 
   OR profile_name IS NULL
ORDER BY created_at DESC;

-- Count of problematic entries
SELECT COUNT(*) as null_profile_count
FROM users 
WHERE profile_name IS NULL OR profile_name = '';

-- Show all users (for reference)
SELECT 
  id,
  profile_name,
  real_name,
  profile_pic_url,
  created_at
FROM users 
ORDER BY created_at DESC;
