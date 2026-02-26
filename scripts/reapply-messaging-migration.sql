-- Re-apply the DELETE policy for conversations
-- Run this in your Supabase SQL Editor

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;

-- Create the DELETE policy
CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  USING (
    auth.uid() = participant_one_id OR 
    auth.uid() = participant_two_id
  );
