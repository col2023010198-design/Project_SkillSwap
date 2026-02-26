# Messaging Module - Setup Guide

This document provides instructions for setting up and using the messaging module with Supabase.

## Overview

The messaging module provides real-time messaging functionality with:
- One-on-one conversations
- Real-time message delivery
- Message read status tracking
- Unread message indicators
- Row-level security for data privacy

## Prerequisites

- Supabase account and project
- Next.js application with TypeScript
- Supabase client library installed (`@supabase/supabase-js`)

## Setup Instructions

### 1. Database Migration

Run the SQL migration file in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the file `supabase/migrations/001_messaging_schema.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click "Run" to execute the migration

This will create:
- `conversations` table
- `messages` table
- All necessary indexes
- Row Level Security (RLS) policies
- Database triggers for timestamp updates

### 2. Environment Variables

Ensure your `.env` or `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Verify Installation

After running the migration, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages');
```

## Usage

### Accessing the Messaging Page

Navigate to `/message` in your application. The page will:
1. Check if the user is authenticated
2. Redirect to `/auth/login` if not authenticated
3. Load the user's conversations
4. Allow selecting a conversation to view messages
5. Enable sending new messages

### Creating a Conversation

Conversations are created automatically when users send messages to each other. To programmatically create a conversation:

```typescript
import { getOrCreateConversation } from '@/lib/api/messaging';

const { data: conversationId, error } = await getOrCreateConversation(
  currentUserId,
  otherUserId
);
```

### Sending Messages

Messages are sent through the UI message input, or programmatically:

```typescript
import { sendMessage } from '@/lib/api/messaging';

const { data: message, error } = await sendMessage(
  conversationId,
  senderId,
  'Hello, world!'
);
```

### Real-Time Updates

The messaging module automatically subscribes to real-time updates:
- New messages appear instantly without page refresh
- Conversation list updates when new messages arrive
- Unread counts update in real-time

## File Structure

```
lib/
├── api/
│   ├── messaging.ts       # Core messaging API functions
│   └── realtime.ts        # Real-time subscription functions
├── types/
│   └── messaging.ts       # TypeScript interfaces
├── utils/
│   ├── messaging.ts       # Utility functions (validation, formatting)
│   └── errors.ts          # Error handling utilities
└── supabase.js           # Supabase client configuration

components/
└── ErrorDisplay.tsx       # Error display component

app/
└── message/
    └── page.tsx          # Main messaging page

supabase/
└── migrations/
    └── 001_messaging_schema.sql  # Database migration
```

## API Reference

### Conversation Functions

#### `getOrCreateConversation(currentUserId, otherUserId)`
Gets an existing conversation or creates a new one between two users.

**Returns:** `{ data: conversationId | null, error: string | null }`

#### `getConversations(currentUserId)`
Retrieves all conversations for the current user with details.

**Returns:** `{ data: ConversationWithDetails[] | null, error: string | null }`

### Message Functions

#### `sendMessage(conversationId, senderId, content)`
Sends a message in a conversation.

**Returns:** `{ data: MessageWithSender | null, error: string | null }`

#### `getMessages(conversationId)`
Retrieves all messages in a conversation.

**Returns:** `{ data: MessageWithSender[] | null, error: string | null }`

#### `markMessagesAsRead(conversationId, currentUserId)`
Marks all unread messages in a conversation as read.

**Returns:** `{ data: null, error: string | null }`

### Real-Time Functions

#### `subscribeToMessages(conversationId, onMessage)`
Subscribes to new messages in a conversation.

**Returns:** `RealtimeChannel`

#### `unsubscribeFromMessages(channel)`
Unsubscribes from a real-time channel.

#### `subscribeToConversationUpdates(userId, onUpdate)`
Subscribes to conversation list updates.

**Returns:** `RealtimeChannel`

## Security

### Row Level Security (RLS)

All database operations are protected by RLS policies:

- Users can only view conversations they participate in
- Users can only view messages from their conversations
- Users can only send messages in conversations they participate in
- Users can only mark messages as read if they are the recipient

### Data Validation

- Message content is validated (1-5000 characters)
- Empty messages are rejected
- User IDs are validated before operations

## Troubleshooting

### Messages not appearing in real-time

1. Check that Supabase Realtime is enabled for your project
2. Verify the real-time subscription is active in browser console
3. Check for any JavaScript errors in the console

### "Failed to load conversations" error

1. Verify the database migration ran successfully
2. Check that RLS policies are enabled
3. Ensure the user is authenticated
4. Check Supabase logs for any errors

### Authentication redirect loop

1. Verify Supabase auth is configured correctly
2. Check that the user session is valid
3. Ensure redirect URLs are configured in Supabase dashboard

### Database errors

1. Check Supabase logs in the dashboard
2. Verify all foreign key relationships are valid
3. Ensure the user exists in the auth.users table

## Performance Considerations

- Conversations are ordered by most recent activity
- Indexes are created on frequently queried columns
- Real-time subscriptions are cleaned up on component unmount
- Messages are loaded only when a conversation is selected

## Future Enhancements

Potential improvements for the messaging module:

- Group conversations (more than 2 participants)
- Message attachments (images, files)
- Message reactions and emoji support
- Typing indicators
- Message search functionality
- Message deletion and editing
- Push notifications for new messages
- Online/offline status indicators

## Support

For issues or questions:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the implementation spec files in `.kiro/specs/messaging-module-implementation/`
3. Check browser console for error messages
4. Review Supabase logs in the dashboard
