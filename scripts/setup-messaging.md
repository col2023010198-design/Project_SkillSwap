# Messaging Module Setup Instructions

## Step 1: Run Database Migration

You need to run the SQL migration in your Supabase dashboard:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/zapkszmkuwcalkjnlzfa
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/001_messaging_schema.sql`
5. Paste into the SQL Editor
6. Click "Run" or press Ctrl+Enter

### Option B: Using Supabase CLI (if installed)

```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 2: Verify Migration

After running the migration, verify it worked:

1. Go to "Table Editor" in Supabase dashboard
2. You should see two new tables:
   - `conversations`
   - `messages`

## Step 3: Test the Messaging Module

1. Make sure your app is running:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/message

3. You should see:
   - Authentication check (redirects to login if not logged in)
   - Empty conversations list (if no conversations exist yet)
   - Ability to send messages once conversations are created

## Step 4: Create Test Data (Optional)

To test the messaging module, you'll need at least 2 users. You can:

1. Register 2 different accounts through your app's registration page
2. Manually create a conversation between them using the Supabase dashboard:
   - Go to Table Editor > conversations
   - Click "Insert row"
   - Fill in participant_one_id and participant_two_id with user IDs from auth.users

## Troubleshooting

### "Failed to load conversations"
- Check that the migration ran successfully
- Verify RLS policies are enabled
- Check browser console for errors

### "Authentication required"
- Make sure you're logged in
- Check that Supabase auth is configured correctly

### Real-time not working
- Verify Realtime is enabled in Supabase project settings
- Check browser console for subscription errors

## Next Steps

Once the messaging module is working:
- Test sending messages between users
- Verify real-time updates work
- Check that unread indicators appear correctly
- Test marking messages as read

For more details, see MESSAGING_README.md
