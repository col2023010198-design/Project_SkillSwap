-- Re-apply the DELETE policies for conversations and messages
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;

-- Create the DELETE policy for conversations
CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  USING (
    auth.uid() = participant_one_id OR 
    auth.uid() = participant_two_id
  );

-- Create the DELETE policy for messages
CREATE POLICY "Users can delete messages in their conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.participant_one_id = auth.uid() OR
        conversations.participant_two_id = auth.uid()
      )
    )
  );
