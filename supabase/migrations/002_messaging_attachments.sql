-- Messaging Attachments Migration
-- Adds support for images and files in messages

-- ============================================================================
-- ADD ATTACHMENTS COLUMNS TO MESSAGES
-- ============================================================================

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

-- ============================================================================
-- INDEXES FOR ATTACHMENTS
-- ============================================================================

CREATE INDEX idx_messages_attachment_type ON messages(attachment_type) WHERE attachment_type IS NOT NULL;

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

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

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN messages.attachment_url IS 'URL to the attachment in Supabase Storage';
COMMENT ON COLUMN messages.attachment_type IS 'Type of attachment: image or file';
COMMENT ON COLUMN messages.attachment_name IS 'Original filename of the attachment';
COMMENT ON COLUMN messages.attachment_size IS 'Size of the attachment in bytes';

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
--
-- DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view attachments from their conversations" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'message-attachments';
-- ALTER TABLE messages DROP CONSTRAINT IF EXISTS attachment_fields_complete;
-- ALTER TABLE messages DROP CONSTRAINT IF EXISTS valid_attachment_type;
-- ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_content_or_attachment_check;
-- ALTER TABLE messages DROP COLUMN IF EXISTS attachment_size;
-- ALTER TABLE messages DROP COLUMN IF EXISTS attachment_name;
-- ALTER TABLE messages DROP COLUMN IF EXISTS attachment_type;
-- ALTER TABLE messages DROP COLUMN IF EXISTS attachment_url;
