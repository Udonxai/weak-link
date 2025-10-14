-- Update users table to support profile setup
-- Add new columns for profile information

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS real_name text,
ADD COLUMN IF NOT EXISTS profile_name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS profile_pic_url text;

-- Update the username column to be optional since we now have profile_name
ALTER TABLE users 
ALTER COLUMN username DROP NOT NULL;

-- Create a function to generate a default profile name if none provided
CREATE OR REPLACE FUNCTION generate_default_profile_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If profile_name is empty, use a default format
  IF NEW.profile_name IS NULL OR NEW.profile_name = '' THEN
    NEW.profile_name := 'User_' || substring(NEW.id::text from 1 for 8);
  END IF;
  
  -- If username is null, use profile_name
  IF NEW.username IS NULL THEN
    NEW.username := NEW.profile_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set default profile name
DROP TRIGGER IF EXISTS set_default_profile_name ON users;
CREATE TRIGGER set_default_profile_name
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_default_profile_name();

-- Update RLS policies to allow reading profile information for group members
CREATE POLICY "Group members can view other members' profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = users.id
    )
  );
