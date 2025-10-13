/*
  # Create Weak Link App Schema

  ## Overview
  This migration creates the complete database schema for the Weak Link social accountability app.
  Users track distraction app usage and compete with friends to avoid being the "weak link."

  ## Tables Created

  ### 1. users
  Extends Supabase auth.users with profile information
  - `id` (uuid, primary key) - Links to auth.users
  - `username` (text, unique) - Display name
  - `created_at` (timestamptz) - Account creation time

  ### 2. groups
  Friend groups for accountability tracking
  - `id` (uuid, primary key) - Unique group identifier
  - `name` (text) - Group display name
  - `invite_code` (text, unique) - Code for joining group
  - `created_by` (uuid) - User who created the group
  - `created_at` (timestamptz) - Group creation time

  ### 3. group_members
  Junction table for users in groups
  - `user_id` (uuid) - References users
  - `group_id` (uuid) - References groups
  - `joined_at` (timestamptz) - When user joined
  - Primary key: (user_id, group_id)

  ### 4. tracked_apps
  Apps being monitored per group
  - `id` (uuid, primary key)
  - `group_id` (uuid) - Which group tracks this app
  - `app_identifier` (text) - Package name or bundle ID
  - `app_name` (text) - Display name
  - `platform` (text) - android or ios

  ### 5. events
  Logs when users open tracked apps
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Who opened the app
  - `group_id` (uuid) - Which group context
  - `app_name` (text) - Which app was opened
  - `app_identifier` (text) - Package/bundle ID
  - `timestamp` (timestamptz) - When it happened

  ## Security
  - RLS enabled on all tables
  - Users can read their own profile
  - Users can update their own profile
  - Group members can read group data
  - Group members can view other members
  - Only group members can see events for their groups
  - Anyone authenticated can create groups
*/

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id bigint PRIMARY KEY,
  username text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id bigint PRIMARY KEY DEFAULT nextval('groups_id_seq'),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_by bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sequence for groups
CREATE SEQUENCE IF NOT EXISTS groups_id_seq;

-- Create group_members junction table
CREATE TABLE IF NOT EXISTS group_members (
  user_id bigint REFERENCES users(id) ON DELETE CASCADE,
  group_id bigint REFERENCES groups(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- Create tracked_apps table
CREATE TABLE IF NOT EXISTS tracked_apps (
  id bigint PRIMARY KEY DEFAULT nextval('tracked_apps_id_seq'),
  group_id bigint REFERENCES groups(id) ON DELETE CASCADE,
  app_identifier text NOT NULL,
  app_name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'both')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, app_identifier)
);

-- Create sequence for tracked_apps
CREATE SEQUENCE IF NOT EXISTS tracked_apps_id_seq;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id bigint PRIMARY KEY DEFAULT nextval('events_id_seq'),
  user_id bigint REFERENCES users(id) ON DELETE CASCADE,
  group_id bigint REFERENCES groups(id) ON DELETE CASCADE,
  app_name text NOT NULL,
  app_identifier text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create sequence for events
CREATE SEQUENCE IF NOT EXISTS events_id_seq;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_events_group_timestamp ON events(group_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_apps_group ON tracked_apps(group_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for groups table
CREATE POLICY "Group members can view their groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for group_members table
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for tracked_apps table
CREATE POLICY "Group members can view tracked apps"
  ON tracked_apps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tracked_apps.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add tracked apps"
  ON tracked_apps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tracked_apps.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can remove tracked apps"
  ON tracked_apps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tracked_apps.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for events table
CREATE POLICY "Group members can view events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = events.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to automatically add group creator as member
CREATE OR REPLACE FUNCTION add_creator_to_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (user_id, group_id)
  VALUES (NEW.created_by, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add creator as member when group is created
DROP TRIGGER IF EXISTS on_group_created ON groups;
CREATE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_to_group();