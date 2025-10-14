# Profile Setup Flow

This document describes the new user profile setup flow implemented in the Weak Link app.

## Overview

The app now supports a streamlined onboarding process where users can set up their profile without requiring email/password authentication. This allows for faster user acquisition and reduced friction.

## Flow

### 1. First Open
When a user opens the app for the first time:
- They see the login screen with options to:
  - Sign in with existing account
  - Create new account
  - **Continue without account** (new option)

### 2. Profile Setup Screen
If the user chooses "Continue without account" or completes signup, they are taken to the profile setup screen where they can:

#### Required Fields:
- **Display Name**: How they'll appear to friends (required)
- **Profile Picture**: Choose from 12 preset emoji-based avatars (required)

#### Optional Fields:
- **Real Name**: Can be used for groups that require real names (optional)

### 3. Behind the Scenes
- A random UUID is generated as the user ID
- User is authenticated anonymously using Supabase's `signInAnonymously()`
- Profile data is stored in Supabase: `{ id, real_name, profile_name, profile_pic_url, created_at }`
- The `username` field has been removed in favor of `profile_name`

### 4. After Setup
- User is directed to the main app (tabs)
- They can immediately start:
  - Creating or joining groups
  - Granting app usage permissions
  - Begin tracking and competing

## Database Schema Changes

The `users` table has been updated with new columns:
- `real_name` (text, nullable) - User's real name
- `profile_name` (text, required) - Display name for the app
- `profile_pic_url` (text, nullable) - Reference to preset avatar
- `username` field has been removed

## Profile Picture Presets

12 preset avatars are available, each with:
- Unique emoji
- Distinctive color
- Unique ID for storage

## Navigation Logic

The app checks profile completion status:
- If user has session but incomplete profile → Profile Setup
- If user has complete profile → Main App
- If no session → Login Screen

## Future Enhancements

- Allow users to link email/phone for account recovery
- Support custom profile picture uploads
- Add more profile customization options
- Implement profile editing in settings
