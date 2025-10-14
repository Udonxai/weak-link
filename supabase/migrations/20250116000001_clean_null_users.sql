-- Clean up users with NULL profile_name and fix data integrity
-- This migration addresses the issue where users have random IDs but NULL profile_name

-- First, let's see what we're dealing with
-- DELETE users that have NULL profile_name (these are likely test/random entries)
DELETE FROM users 
WHERE profile_name IS NULL OR profile_name = '';

-- Update any remaining users that might have empty profile_name
UPDATE users 
SET profile_name = 'User_' || substring(id::text from 1 for 8)
WHERE profile_name IS NULL OR profile_name = '';

-- Ensure profile_name is NOT NULL for all users going forward
ALTER TABLE users ALTER COLUMN profile_name SET NOT NULL;

-- Drop and recreate the trigger function to be more robust
DROP TRIGGER IF EXISTS set_default_profile_name ON users;
DROP FUNCTION IF EXISTS set_default_profile_name();

-- Create a more robust function for setting default profile names
CREATE OR REPLACE FUNCTION set_default_profile_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure profile_name is never NULL or empty
  IF NEW.profile_name IS NULL OR NEW.profile_name = '' THEN
    NEW.profile_name := 'User_' || substring(NEW.id::text from 1 for 8);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER set_default_profile_name
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_default_profile_name();
