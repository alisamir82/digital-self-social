# Supabase Storage Setup Guide

This guide will walk you through setting up Storage buckets and policies for Digital Self Social.

## Prerequisites

✅ You've already completed:
- Created a Supabase project
- Run the database schema (`supabase-schema.sql`)
- Created the Storage buckets
- Added Supabase credentials to the app

## Step 1: Verify Your Buckets

Go to **Storage** in your Supabase dashboard and verify you have these buckets:

1. **videos** - For video files
2. **thumbnails** - For video thumbnails  
3. **avatars** (optional) - For user profile pictures
4. **banners** (optional) - For channel banners

## Step 2: Make Buckets Public

For each bucket, you need to make it **public** so files can be accessed via URL:

1. Click on the bucket name
2. Click the **Settings** icon (gear icon)
3. Toggle **Public bucket** to ON
4. Click **Save**

Repeat for all buckets (videos, thumbnails, avatars, banners).

## Step 3: Apply Storage Policies

Now you need to set up Row Level Security (RLS) policies for the buckets.

### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy the entire contents of `supabase-storage-policies.sql`
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`

You should see a success message indicating all policies were created.

### Option B: Using Supabase Dashboard UI

Alternatively, you can create policies manually through the UI:

1. Go to **Storage** → **Policies**
2. For each bucket, click **New Policy**
3. Create the following policies:

#### For `videos` bucket:

**Policy 1: Public Read**
- Policy name: `Public read access for videos`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'videos'`

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload videos`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 3: User Update**
- Policy name: `Users can update their own videos`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text`
- WITH CHECK expression: `bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 4: User Delete**
- Policy name: `Users can delete their own videos`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text`

Repeat similar policies for `thumbnails`, `avatars`, and `banners` buckets.

## Step 4: Verify Policies

Run this query in SQL Editor to verify your policies:

```sql
-- Check videos bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'videos';

-- Check thumbnails bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'thumbnails';
```

You should see 4 policies for each bucket.

## Step 5: Test Upload Functionality

Now test if uploads work correctly:

1. Open your Digital Self Social app
2. Sign in with a test account
3. Go to the **Upload** tab
4. Try uploading a video

If everything is configured correctly:
- ✅ The video should upload successfully
- ✅ A thumbnail should be generated
- ✅ The video should appear in your feed
- ✅ You should be able to play it

## Troubleshooting

### Error: "new row violates row-level security policy"

**Problem**: Policies are not set up correctly or buckets are not public.

**Solution**:
1. Verify buckets are set to **Public**
2. Re-run the `supabase-storage-policies.sql` script
3. Check that policies exist: `SELECT * FROM storage.policies;`

### Error: "Failed to upload video"

**Problem**: File size limit or network issue.

**Solution**:
1. Check file size (default Supabase limit is 50MB)
2. Increase limit in **Storage Settings** if needed
3. Check your internet connection
4. Verify Supabase credentials are correct in app

### Error: "Could not access file"

**Problem**: Bucket is not public or URL is incorrect.

**Solution**:
1. Verify bucket is set to **Public**
2. Check the file URL format: `https://{project}.supabase.co/storage/v1/object/public/videos/{user_id}/{filename}`
3. Try accessing the URL directly in a browser

### Error: "Permission denied"

**Problem**: User is trying to access/modify files they don't own.

**Solution**:
- This is expected behavior! Users can only upload/modify files in their own folders
- File structure should be: `videos/{user_id}/{filename}`

## File Structure Convention

The app uses this folder structure:

```
videos/
  {user_id}/
    {video_id}.mp4
    
thumbnails/
  {user_id}/
    {video_id}.jpg
    
avatars/
  {user_id}/
    avatar.jpg
    
banners/
  {user_id}/
    banner.jpg
```

This ensures:
- Users can only upload to their own folders
- Files are organized by user
- Easy to manage and delete user data

## Storage Limits

Default Supabase limits:
- **Free tier**: 1GB storage, 2GB bandwidth per month
- **Pro tier**: 8GB storage, 50GB bandwidth per month
- **File size limit**: 50MB per file (configurable)

To increase limits:
1. Go to **Settings** → **Storage**
2. Adjust **File size limit**
3. Upgrade your plan if needed

## Best Practices

1. **Compress videos before upload** - Use the built-in compression in the app
2. **Generate thumbnails** - Always upload a thumbnail with videos
3. **Use appropriate formats**:
   - Videos: MP4 (H.264)
   - Thumbnails: JPG or WebP
   - Avatars: JPG or PNG (square, 256x256)
4. **Monitor storage usage** - Check Supabase dashboard regularly
5. **Implement cleanup** - Delete old/unused files periodically

## Next Steps

After completing Storage setup:

1. ✅ **Enable Realtime** - Go to Database → Replication and enable Realtime for all tables
2. ✅ **Configure Auth providers** - Set up Google/Apple OAuth if needed
3. ✅ **Test all features** - Upload videos, comment, like, subscribe
4. ✅ **Monitor usage** - Check Storage and Database usage in dashboard

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check the app console for error messages
4. Refer to `SUPABASE_SETUP.md` for general setup help

---

**Setup Complete!** 🎉

Your Storage is now configured and ready to handle video uploads, thumbnails, and user assets.
