# URGENT: Apply DELETE Policy to Supabase

The delete conversation feature is not working because the DELETE policy is missing from your Supabase database.

## What Gets Deleted:

When you delete a conversation, the following happens AUTOMATICALLY:
1. ✅ The conversation record is deleted from the `conversations` table
2. ✅ ALL messages in that conversation are deleted from the `messages` table (CASCADE DELETE)
3. ✅ Everything is permanently removed from Supabase

The CASCADE DELETE is already configured in your database schema (line 28 of the migration file).

## Steps to Fix:

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add DELETE policies for conversations and messages
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;

CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  USING (
    auth.uid() = participant_one_id OR 
    auth.uid() = participant_two_id
  );

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
```

6. Click **Run** or press Ctrl+Enter
7. You should see "Success. No rows returned"
8. Go back to your app and try deleting a conversation again

## Verify Complete Deletion:

After running the SQL and deleting a conversation:

1. Go to Supabase Dashboard → Table Editor
2. Check the `conversations` table - the conversation should be GONE
3. Check the `messages` table - all messages from that conversation should be GONE
4. Both are permanently deleted from the database

## Why This Is Needed:

Without this DELETE policy, Supabase's Row Level Security (RLS) blocks the delete operation even though your code is correct. The policy tells Supabase: "Allow users to delete conversations where they are a participant."

## If You Still See Issues:

Open browser console (F12) and look for error messages when you click delete. Share those errors if the problem persists.
