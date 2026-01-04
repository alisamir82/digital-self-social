# Authentication Setup Guide - Digital Self Social

This guide will help you fix authentication issues including email verification redirects and OAuth configuration.

## Issue 1: Email Verification Redirect (CRITICAL)

### Problem
When users sign up, they receive a verification email from Supabase. However, the link points to `localhost`, which doesn't work on mobile devices.

### Solution: Configure Redirect URLs in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **Authentication** in the left sidebar
   - Click on **URL Configuration**

2. **Update Site URL**
   - Find the **"Site URL"** field
   - Replace `http://localhost:3000` with your app's deep link scheme
   - Use this format: `manus20260103202407://`
   - Click **Save**

3. **Add Redirect URLs**
   - Scroll down to **"Redirect URLs"** section
   - Click **"Add URL"**
   - Add these URLs (one at a time):
     ```
     manus20260103202407://**
     exp://localhost:8081
     http://localhost:8081
     ```
   - Click **Save** after adding each one

### What These URLs Do

| URL | Purpose |
|-----|---------|
| `manus20260103202407://**` | Deep link for mobile app (Expo Go) |
| `exp://localhost:8081` | Expo development server |
| `http://localhost:8081` | Web preview during development |

---

## Issue 2: Row-Level Security (RLS) Policies

### Problem
Users can't create profiles because RLS policies are too restrictive.

### Solution: Update RLS Policies

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Fix profiles table RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies that allow profile creation
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## Issue 3: OAuth Providers (Google & Apple)

### Current Status
OAuth buttons appear in the app but aren't configured in Supabase yet.

### To Enable Google Sign-In:

1. **Go to Supabase Dashboard**
   - Click **Authentication** → **Providers**
   - Find **Google** and toggle it **ON**

2. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

3. **Configure in Supabase**
   - Paste **Client ID** and **Client Secret** in Supabase
   - Click **Save**

### To Enable Apple Sign-In:

1. **Requirements**
   - Apple Developer account ($99/year)
   - Registered app in App Store Connect

2. **Configure in Supabase**
   - Go to **Authentication** → **Providers**
   - Toggle **Apple** ON
   - Follow Supabase's setup instructions

---

## Temporary Workaround: Disable Email Confirmation

If you want to test immediately without fixing redirect URLs:

1. Go to **Authentication** → **Settings** in Supabase
2. Find **"Enable email confirmations"**
3. Toggle it **OFF**
4. Click **Save**

**⚠️ Warning**: This allows users to sign up without verifying their email. Only use for testing!

---

## Testing the Fix

### Test Email Sign-Up (After Fixing Redirects):

1. Open the app in Expo Go
2. Tap **"Sign Up"**
3. Enter email and password
4. Check your email for verification link
5. Click the link (should open in the app now)
6. You should be logged in automatically

### Test Without Email Confirmation (Temporary):

1. Disable email confirmation in Supabase (see above)
2. Sign up with email/password
3. You'll be logged in immediately
4. No email verification needed

---

## Quick Reference: Your App's Deep Link

Your app's deep link scheme is: **`manus20260103202407://`**

This is automatically generated based on your project's bundle ID and is used for:
- Email verification redirects
- OAuth redirects
- Deep linking from external sources

---

## Need Help?

If you encounter errors:
1. Check the Expo Go console for error messages
2. Check Supabase logs: **Dashboard** → **Logs** → **Auth Logs**
3. Verify all redirect URLs are saved correctly
4. Make sure RLS policies are updated

---

## Summary Checklist

- [ ] Update Site URL in Supabase to `manus20260103202407://`
- [ ] Add redirect URLs in Supabase
- [ ] Run RLS policy fix SQL script
- [ ] Test email sign-up flow
- [ ] (Optional) Configure Google OAuth
- [ ] (Optional) Configure Apple OAuth
- [ ] (Temporary) Disable email confirmation for quick testing

Once these are configured, authentication should work smoothly!
