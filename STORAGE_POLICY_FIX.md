# Fix Storage Upload Errors - UI Method

Since your Supabase version manages Storage policies through the UI, follow these steps to fix upload errors.

## Step 1: Check Bucket Configuration

1. Go to **Storage** in Supabase Dashboard
2. Click on the **videos** bucket
3. Verify it's set to **Public**
4. Click on **Policies** tab

## Step 2: Delete Existing Policies (if any)

In the Policies tab for each bucket (videos, thumbnails, avatars, banners):
1. Delete all existing policies by clicking the trash icon
2. We'll recreate them correctly

## Step 3: Create New Policies for Videos Bucket

### Policy 1: Public Read Access
1. Click **New Policy**
2. Choose **Custom** or **For full customization**
3. Fill in:
   - **Policy name**: `Public read access for videos`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
     ```sql
     bucket_id = 'videos'
     ```
   - **Target roles**: `public`
4. Click **Save**

### Policy 2: Authenticated Upload
1. Click **New Policy**
2. Fill in:
   - **Policy name**: `Authenticated users can upload videos`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
     ```sql
     bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - **Target roles**: `authenticated`
3. Click **Save**

### Policy 3: Update Own Videos
1. Click **New Policy**
2. Fill in:
   - **Policy name**: `Users can update their own videos`
   - **Allowed operation**: `UPDATE`
   - **USING expression**:
     ```sql
     bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - **Target roles**: `authenticated`
3. Click **Save**

### Policy 4: Delete Own Videos
1. Click **New Policy**
2. Fill in:
   - **Policy name**: `Users can delete their own videos`
   - **Allowed operation**: `DELETE`
   - **Policy definition**:
     ```sql
     bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - **Target roles**: `authenticated`
3. Click **Save**

## Step 4: Repeat for Thumbnails Bucket

Repeat Step 3 for the **thumbnails** bucket, replacing:
- `videos` → `thumbnails`
- `Public read access for videos` → `Public read access for thumbnails`
- `Authenticated users can upload videos` → `Authenticated users can upload thumbnails`
- etc.

## Step 5: (Optional) Repeat for Avatars and Banners

If you want profile pictures and channel banners:
- Repeat for **avatars** bucket
- Repeat for **banners** bucket

---

## Alternative: Simpler Policy (Less Secure)

If the above is too complex, you can use a simpler policy for testing:

### For Videos Bucket:
1. **Public Read**:
   - Operation: `SELECT`
   - Policy: `bucket_id = 'videos'`
   - Role: `public`

2. **Authenticated Upload/Update/Delete**:
   - Operation: `ALL` (or `INSERT`, `UPDATE`, `DELETE`)
   - Policy: `bucket_id = 'videos'`
   - Role: `authenticated`

This allows any authenticated user to upload/modify any video (less secure, but works for testing).

---

## Step 6: Test Upload

After creating policies:
1. Reload the app in Expo Go
2. Try uploading a video
3. If it still fails, check the error in the console

---

## Common Issues

### "Policy check failed"
- Make sure the policy definition syntax is correct
- Verify the bucket name matches exactly

### "Row Level Security policy violation"
- Ensure RLS is enabled on the bucket
- Check that the target role is set correctly

### "Permission denied"
- Verify you're logged in (authenticated)
- Check that the file path starts with your user ID

---

## Need Help?

If policies still don't work, try this temporary workaround:

1. Go to **Storage** → **Policies**
2. Click **Disable RLS** on the videos bucket
3. This makes the bucket fully public (not recommended for production!)
4. Test if upload works
5. If it works, the issue is with the policy definitions
6. Re-enable RLS and fix the policies

---

**After fixing policies, uploads should work!** 🎉
