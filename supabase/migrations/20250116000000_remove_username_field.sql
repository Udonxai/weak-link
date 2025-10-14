-- Remove username field from users table
-- This migration removes the username field since we're using profile_name as the primary display name

-- First, drop the trigger that was setting username
DROP TRIGGER IF EXISTS set_default_profile_name ON users;

-- Drop the function that was managing username
DROP FUNCTION IF EXISTS generate_default_profile_name();

-- Remove the username column entirely
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- Create a new function for setting default profile names without username
CREATE OR REPLACE FUNCTION set_default_profile_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If profile_name is empty, use a default format
  IF NEW.profile_name IS NULL OR NEW.profile_name = '' THEN
    NEW.profile_name := 'User_' || substring(NEW.id::text from 1 for 8);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger to set default profile name (without username logic)
CREATE TRIGGER set_default_profile_name
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_default_profile_name();
