# Messaging Attachments Setup Guide

This guide will help you set up image and file attachments for your messaging system using Supabase.

## Features Added

- **Image Uploads**: Send images (JPEG, PNG, GIF, WebP) up to 5MB
- **File Uploads**: Send documents (PDF, Word, Excel, ZIP, TXT) up to 10MB
- **Preview**: Images show inline preview, files show as downloadable links
- **Secure Storage**: Files stored in Supabase Storage with proper access controls

## Database Migration

You need to run the SQL migration to add attachment support to your database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/002_messaging_attachments.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
cd Project_SkillSwap
supabase db push
```

### Option 3: Manual SQL Execution

Run this SQL in your Supabase SQL Editor:

```sql
-- Add attachment columns to messages table
ALTER TABLE messages
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type VARCHAR(50),
ADD COLUMN attachment_name TEXT,
ADD COLUMN attachment_size INTEGER;

-- Add check constraint for attachment types
ALTER TABLE messages
ADD CONSTRAINT valid_attachment_type 
CHECK (
  attachment_type IS NULL OR 
  attachment_type IN ('image', 'file')
);

-- Add check constraint: if attachment exists, all fields must be present
ALTER TABLE messages
ADD CONSTRAINT attachment_fields_complete
CHECK (
  (attachment_url IS NULL AND attachment_type IS NULL AND attachment_name IS NULL AND attachment_size IS NULL) OR
  (attachment_url IS NOT NULL AND attachment_type IS NOT NULL AND attachment_name IS NOT NULL AND attachment_size IS NOT NULL)
);

-- Modify content constraint to allow empty content if attachment exists
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_content_check;

ALTER TABLE messages
ADD CONSTRAINT messages_content_or_attachment_check
CHECK (
  (char_length(content) > 0 AND char_length(content) <= 5000) OR
  (attachment_url IS NOT NULL)
);

-- Create index for attachments
CREATE INDEX idx_messages_attachment_type ON messages(attachment_type) WHERE attachment_type IS NOT NULL;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view attachments from their conversations
CREATE POLICY "Users can view attachments from their conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (
    -- User is the uploader
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- User is a participant in a conversation with a message containing this attachment
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.attachment_url LIKE '%' || name || '%'
      AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  )
);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Verification

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `messages` table
3. You should see new columns:
   - `attachment_url`
   - `attachment_type`
   - `attachment_name`
   - `attachment_size`

4. Go to **Storage** in Supabase Dashboard
5. You should see a new bucket called `message-attachments`

## Usage

### Sending Messages with Attachments

Users can now:
1. Click the attachment icon (📎) in the message input
2. Select an image or file
3. See a preview of the selected file
4. Optionally add text to accompany the attachment
5. Send the message

### Supported File Types

**Images** (max 5MB):
- JPEG/JPG
- PNG
- GIF
- WebP

**Documents** (max 10MB):
- PDF
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- ZIP archives
- Text files (.txt)

### Viewing Attachments

- **Images**: Display inline with full preview, click to open in new tab
- **Files**: Show as downloadable cards with file name and size

## Security

The implementation includes:
- File type validation
- File size limits
- User authentication required
- Row-level security policies
- Users can only access attachments from their own conversations

## Troubleshooting

### Storage bucket not created
If the bucket wasn't created automatically, create it manually:
1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `message-attachments`
4. Public: **No** (keep it private)
5. Click **Create bucket**

### Upload fails
- Check that the user is authenticated
- Verify file size is within limits
- Ensure file type is supported
- Check browser console for errors

### Can't view attachments
- Verify storage policies are created
- Check that the user is a participant in the conversation
- Ensure the attachment URL is correctly stored in the database

## Rollback

If you need to remove the attachment feature:

```sql
DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments from their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'message-attachments';
ALTER TABLE messages DROP CONSTRAINT IF EXISTS attachment_fields_complete;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS valid_attachment_type;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_content_or_attachment_check;
ALTER TABLE messages DROP COLUMN IF EXISTS attachment_size;
ALTER TABLE messages DROP COLUMN IF EXISTS attachment_name;
ALTER TABLE messages DROP COLUMN IF EXISTS attachment_type;
ALTER TABLE messages DROP COLUMN IF EXISTS attachment_url;
```

## Files Modified

- `lib/types/messaging.ts` - Added attachment types
- `lib/utils/fileUpload.ts` - New file upload utilities
- `lib/api/messaging.ts` - Updated sendMessage function
- `app/message/page.tsx` - Added file upload UI
- `supabase/migrations/002_messaging_attachments.sql` - Database migration

## Next Steps

1. Run the SQL migration
2. Test uploading an image
3. Test uploading a document
4. Verify attachments display correctly
5. Test on mobile devices

Enjoy your enhanced messaging system! 🎉
