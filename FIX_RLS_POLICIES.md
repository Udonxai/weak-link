# Fix RLS Policies for Profile Pictures

## ❌ Issue Found

Your app uses **custom numeric user IDs** in the `users` table, but the RLS policies were checking `auth.uid()` which expects UUID strings. This caused "new row violates row-level security policy" errors.

## ✅ Solution

Update your INSERT policy to work with the anon key (which your app uses).

### **Updated INSERT Policy**

Go to **Authentication > Policies** in Supabase, delete the old policy, and create this one:

```sql
CREATE POLICY "Allow uploads to profile-pictures bucket"
ON "storage"."objects"
FOR INSERT
USING (bucket_id = 'profile-pictures');
```

**Key change**: Removed the `auth.uid()` check since your app uses numeric user IDs, not Supabase auth UUIDs.

### **Why This Works**

1. Your app uses the **anon key** (public API key) to communicate with Supabase
2. Files are organized by folder: `{userId}/filename.jpg` 
3. Profile pictures are meant to be public anyway
4. The folder structure prevents conflicts between users

### **Alternative: If You Want Stricter Security**

If you want to add more security later, you can:
1. Sign in users anonymously with `supabase.auth.signInAnonymously()`
2. Then match `auth.uid()` in policies
3. But this adds complexity without much benefit for public profile pictures

## 📋 Quick Fix Steps

1. Go to **Authentication > Policies** in Supabase Dashboard
2. Find the policy: "Users can upload their own profile pictures"
3. Click the **pencil icon** to edit it
4. Replace the content with:
   ```sql
   CREATE POLICY "Allow uploads to profile-pictures bucket"
   ON "storage"."objects"
   FOR INSERT
   US܌ING (bucket_id = 'profile-pictures');
   ```
5. Click **Save**
6. Try uploading a profile picture again!

## 🎯 Keep These Policies

- ✅ Public read policy (for viewing images)
- ✅ New simplified INSERT policy (for uploading)

The public read policy doesn't need any changes.
