# Supabase Setup Guide for Digital Self Social

This guide will help you set up Supabase as the backend for your Digital Self Social (DS Social) mobile app.

## Prerequisites

Before you begin, you need:
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of PostgreSQL and Supabase

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: Digital Self Social (or DS Social)
   - **Database Password**: Choose a strong password and save it securely
   - **Region**: Choose the region closest to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Run the Database Schema

Once your project is ready, you need to create the database tables:

1. In your Supabase project dashboard, click on the **"SQL Editor"** tab in the left sidebar
2. Click **"New query"**
3. Open the `supabase-schema.sql` file in this project directory
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click **"Run"** to execute the schema
7. You should see a success message confirming all tables were created

## Step 3: Set Up Storage Buckets

Digital Self Social uses Supabase Storage for videos, thumbnails, and user uploads:

1. In your Supabase dashboard, click on **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Create the following buckets (one at a time):

### Bucket 1: videos
- **Name**: `videos`
- **Public bucket**: ✅ Checked
- Click **"Create bucket"**

### Bucket 2: thumbnails
- **Name**: `thumbnails`
- **Public bucket**: ✅ Checked
- Click **"Create bucket"**

### Bucket 3: avatars
- **Name**: `avatars`
- **Public bucket**: ✅ Checked
- Click **"Create bucket"**

### Bucket 4: banners
- **Name**: `banners`
- **Public bucket**: ✅ Checked
- Click **"Create bucket"**

## Step 4: Configure Storage Policies

After creating the buckets, you need to set up Row Level Security (RLS) policies to control who can upload, read, update, and delete files.

### Quick Setup (Recommended)

The easiest way to set up all policies at once:

1. Go to **"SQL Editor"** in your Supabase dashboard
2. Click **"New query"**
3. Open the `supabase-storage-policies.sql` file from the project
4. Copy and paste the entire contents into the SQL Editor
5. Click **"Run"** to execute

This will automatically create all necessary policies for:
- ✅ Public read access to all files
- ✅ Authenticated users can upload to their own folders
- ✅ Users can only modify/delete their own files
- ✅ Proper folder structure enforcement (`{bucket}/{user_id}/{filename}`)

### Verify Policies

After running the script, verify the policies were created:

```sql
-- Check videos bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'videos';

-- Check thumbnails bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'thumbnails';
```

You should see 4 policies for each bucket.

**For detailed instructions and troubleshooting**, see `STORAGE_SETUP_GUIDE.md`.

## Step 5: Enable Realtime

For live features (chat, live streams), enable Realtime on specific tables:

1. Go to **"Database"** → **"Replication"** in the left sidebar
2. Find and enable Realtime for these tables:
   - ✅ `chat_messages`
   - ✅ `live_streams`
   - ✅ `likes`
   - ✅ `comments`
   - ✅ `subscriptions`
3. Click **"Save"**

## Step 6: Get Your API Keys

You need two keys to connect your app to Supabase:

1. Go to **"Settings"** → **"API"** in the left sidebar
2. Copy the following values:
   - **Project URL**: This is your `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public**: This is your `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Step 7: Configure Environment Variables in the App

You have two options to provide the Supabase credentials:

### Option A: Using the Manus UI (Recommended)
1. The app will prompt you to enter the Supabase credentials
2. Enter your **Supabase URL** and **Anon Key** when requested
3. The credentials will be securely stored

### Option B: Manual .env file (for local development)
1. Create a `.env` file in the project root directory
2. Add the following lines:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. Replace the values with your actual Supabase credentials
4. **Never commit the .env file to Git** (it's already in .gitignore)

## Step 8: Enable Authentication Providers

Digital Self Social supports multiple authentication methods:

1. Go to **"Authentication"** → **"Providers"** in the left sidebar
2. Enable the following providers:

### Email Authentication (Default)
- Already enabled by default
- Users can sign up with email and password

### Google OAuth (Recommended)
1. Click on **"Google"**
2. Enable the provider
3. Follow Supabase's instructions to set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add the redirect URL from Supabase
   - Copy Client ID and Client Secret to Supabase

### Apple OAuth (Recommended for iOS)
1. Click on **"Apple"**
2. Enable the provider
3. Follow Supabase's instructions to set up Apple Sign In:
   - Go to [Apple Developer](https://developer.apple.com)
   - Create a Services ID
   - Configure Sign in with Apple
   - Copy the credentials to Supabase

## Step 9: Test the Connection

To verify everything is set up correctly:

1. Start the app development server:
```bash
pnpm dev
```

2. Open the app in Expo Go on your device
3. Try to sign up with a test account
4. Check the Supabase dashboard under **"Authentication"** → **"Users"** to see if the user was created

## Step 10: Configure Email Templates (Optional)

Customize the authentication emails:

1. Go to **"Authentication"** → **"Email Templates"**
2. Customize the following templates:
   - **Confirm signup**: Welcome email with verification link
   - **Magic Link**: Passwordless login email
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset email

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and Anon Key are correct
- Check that your Supabase project is running (not paused)
- Ensure you're connected to the internet

### Storage Upload Errors
- Verify storage policies are set up correctly
- Check that buckets are marked as public
- Ensure file sizes are within limits (default: 50MB)

### Authentication Errors
- Check that email authentication is enabled
- Verify OAuth providers are configured correctly
- Ensure redirect URLs match exactly

### Realtime Not Working
- Verify Realtime is enabled for the required tables
- Check that RLS policies allow reading the data
- Ensure WebSocket connections are not blocked

## Next Steps

Once Supabase is set up, you can:
1. Start building the app features
2. Test video uploads and playback
3. Implement real-time chat
4. Add push notifications
5. Deploy the app to production

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter any issues:
- Check the [Supabase Discord](https://discord.supabase.com)
- Visit [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
- Review the [Supabase Status Page](https://status.supabase.com)
