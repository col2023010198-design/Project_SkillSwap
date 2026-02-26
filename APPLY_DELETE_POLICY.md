# URGENT: Apply DELETE Policy to Supabase

The delete conversation feature is not working because the DELETE policy is missing from your Supabase database.

## Steps to Fix:

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add DELETE policy for conversations
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;

CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  USING (
    auth.uid() = participant_one_id OR 
    auth.uid() = participant_two_id
  );
```

6. Click **Run** or press Ctrl+Enter
7. You should see "Success. No rows returned"
8. Go back to your app and try deleting a conversation again

## What This Does:

This policy allows users to delete conversations where they are either participant_one_id or participant_two_id. When a conversation is deleted, all messages in that conversation are automatically deleted due to the CASCADE delete constraint.

## Verify It's Working:

After running the SQL:
1. Refresh your messaging page
2. Click the 3-dot menu on a conversation
3. Click Delete
4. Confirm the deletion
5. The conversation should disappear immediately

If you see any errors in the browser console (F12), please share them.
