# Requirements Document

## Introduction

This document specifies the requirements for implementing a functional messaging module using Supabase as the backend. The system will replace the current static messaging UI with a fully functional real-time messaging system that supports conversations between users, message persistence, and real-time updates.

## Glossary

- **Messaging_System**: The complete messaging module including database, API, and UI components
- **User**: An authenticated person using the messaging functionality
- **Conversation**: A message thread between two users
- **Message**: A single text communication sent from one user to another within a conversation
- **Supabase_Client**: The Supabase JavaScript client used to interact with the database
- **Real_Time_Channel**: Supabase real-time subscription for live message updates
- **Message_Status**: The delivery state of a message (sent, delivered, read)
- **Unread_Count**: The number of messages in a conversation that have not been read by the recipient

## Requirements

### Requirement 1: Database Schema for Conversations

**User Story:** As a developer, I want a database schema for conversations, so that the system can store and retrieve conversation metadata between users.

#### Acceptance Criteria

1. THE Messaging_System SHALL create a conversations table with columns: id, participant_one_id, participant_two_id, created_at, updated_at
2. THE Messaging_System SHALL enforce that participant_one_id references the users table
3. THE Messaging_System SHALL enforce that participant_two_id references the users table
4. THE Messaging_System SHALL create a unique constraint preventing duplicate conversations between the same two users regardless of order
5. THE Messaging_System SHALL create an index on participant_one_id and participant_two_id for query performance

### Requirement 2: Database Schema for Messages

**User Story:** As a developer, I want a database schema for messages, so that the system can store and retrieve individual messages within conversations.

#### Acceptance Criteria

1. THE Messaging_System SHALL create a messages table with columns: id, conversation_id, sender_id, content, created_at, read_at
2. THE Messaging_System SHALL enforce that conversation_id references the conversations table with cascade delete
3. THE Messaging_System SHALL enforce that sender_id references the users table
4. THE Messaging_System SHALL create an index on conversation_id for query performance
5. THE Messaging_System SHALL create an index on created_at for chronological ordering
6. THE Messaging_System SHALL enforce that content is not null and has a maximum length of 5000 characters

### Requirement 3: Row Level Security Policies

**User Story:** As a user, I want my messages to be private, so that only participants in a conversation can access the messages.

#### Acceptance Criteria

1. THE Messaging_System SHALL enable row level security on the conversations table
2. THE Messaging_System SHALL enable row level security on the messages table
3. THE Messaging_System SHALL allow users to read conversations where they are participant_one_id or participant_two_id
4. THE Messaging_System SHALL allow users to insert conversations where they are participant_one_id or participant_two_id
5. THE Messaging_System SHALL allow users to read messages only from conversations they participate in
6. THE Messaging_System SHALL allow users to insert messages only into conversations they participate in
7. THE Messaging_System SHALL allow users to update only the read_at field of messages where they are the recipient

### Requirement 4: Retrieve Conversation List

**User Story:** As a user, I want to see a list of my conversations, so that I can select which conversation to view.

#### Acceptance Criteria

1. WHEN a user views the messages page, THE Messaging_System SHALL retrieve all conversations where the user is a participant
2. THE Messaging_System SHALL include the other participant's profile information for each conversation
3. THE Messaging_System SHALL include the most recent message content and timestamp for each conversation
4. THE Messaging_System SHALL calculate and include the unread message count for each conversation
5. THE Messaging_System SHALL order conversations by the most recent message timestamp in descending order
6. IF a conversation has no messages, THEN THE Messaging_System SHALL display the conversation with a placeholder message

### Requirement 5: Create New Conversation

**User Story:** As a user, I want to start a conversation with another user, so that I can send them messages.

#### Acceptance Criteria

1. WHEN a user initiates a message to another user, THE Messaging_System SHALL check if a conversation already exists between them
2. IF a conversation exists, THEN THE Messaging_System SHALL return the existing conversation
3. IF a conversation does not exist, THEN THE Messaging_System SHALL create a new conversation with both users as participants
4. THE Messaging_System SHALL ensure participant_one_id is always the lower user ID to maintain consistency
5. WHEN a conversation is created, THE Messaging_System SHALL return the conversation ID

### Requirement 6: Send Messages

**User Story:** As a user, I want to send messages in a conversation, so that I can communicate with another user.

#### Acceptance Criteria

1. WHEN a user submits a message, THE Messaging_System SHALL validate that the message content is not empty
2. WHEN a user submits a message, THE Messaging_System SHALL validate that the message content does not exceed 5000 characters
3. WHEN a valid message is submitted, THE Messaging_System SHALL insert the message into the messages table with the current timestamp
4. WHEN a message is inserted, THE Messaging_System SHALL update the conversation's updated_at timestamp
5. WHEN a message is sent, THE Messaging_System SHALL clear the message input field
6. IF message insertion fails, THEN THE Messaging_System SHALL display an error message to the user

### Requirement 7: Retrieve Conversation Messages

**User Story:** As a user, I want to view all messages in a conversation, so that I can read the message history.

#### Acceptance Criteria

1. WHEN a user selects a conversation, THE Messaging_System SHALL retrieve all messages for that conversation
2. THE Messaging_System SHALL order messages by created_at timestamp in ascending order
3. THE Messaging_System SHALL include sender information for each message
4. THE Messaging_System SHALL display messages from the current user aligned to the right
5. THE Messaging_System SHALL display messages from the other user aligned to the left
6. THE Messaging_System SHALL format timestamps in a human-readable relative format

### Requirement 8: Real-Time Message Updates

**User Story:** As a user, I want to see new messages immediately, so that I can have real-time conversations.

#### Acceptance Criteria

1. WHEN a user views a conversation, THE Messaging_System SHALL subscribe to a Real_Time_Channel for that conversation
2. WHEN a new message is inserted into the conversation, THE Messaging_System SHALL receive the message via the Real_Time_Channel
3. WHEN a new message is received, THE Messaging_System SHALL append it to the message list without page refresh
4. WHEN a user navigates away from a conversation, THE Messaging_System SHALL unsubscribe from the Real_Time_Channel
5. THE Messaging_System SHALL handle real-time connection errors gracefully without crashing

### Requirement 9: Mark Messages as Read

**User Story:** As a user, I want messages to be marked as read when I view them, so that the sender knows I've seen their messages.

#### Acceptance Criteria

1. WHEN a user opens a conversation, THE Messaging_System SHALL mark all unread messages in that conversation as read
2. WHEN a message is marked as read, THE Messaging_System SHALL update the read_at timestamp to the current time
3. THE Messaging_System SHALL only mark messages as read where the current user is the recipient
4. WHEN messages are marked as read, THE Messaging_System SHALL update the unread count in the conversation list
5. THE Messaging_System SHALL update the read status without requiring a page refresh

### Requirement 10: Display Unread Indicators

**User Story:** As a user, I want to see which conversations have unread messages, so that I know which conversations need my attention.

#### Acceptance Criteria

1. THE Messaging_System SHALL display a visual indicator on conversations with unread messages
2. THE Messaging_System SHALL calculate the unread count as messages where read_at is null and the recipient is the current user
3. WHEN all messages in a conversation are read, THE Messaging_System SHALL remove the unread indicator
4. THE Messaging_System SHALL update unread indicators in real-time when new messages arrive
5. WHERE the unread count exceeds zero, THE Messaging_System SHALL display the indicator prominently

### Requirement 11: Authentication Integration

**User Story:** As a user, I want messaging to work with my authenticated account, so that my messages are associated with my identity.

#### Acceptance Criteria

1. THE Messaging_System SHALL retrieve the current user's ID from the Supabase authentication session
2. IF a user is not authenticated, THEN THE Messaging_System SHALL redirect them to the login page
3. THE Messaging_System SHALL use the authenticated user's ID for all message and conversation operations
4. WHEN a user logs out, THE Messaging_System SHALL clear any cached message data
5. THE Messaging_System SHALL handle authentication token expiration gracefully

### Requirement 12: Message Input Validation

**User Story:** As a user, I want helpful feedback when composing messages, so that I know if my message is valid before sending.

#### Acceptance Criteria

1. THE Messaging_System SHALL disable the send button when the message input is empty
2. THE Messaging_System SHALL disable the send button when the message exceeds 5000 characters
3. WHERE the message exceeds 5000 characters, THE Messaging_System SHALL display a character count warning
4. THE Messaging_System SHALL trim whitespace from messages before validation
5. WHEN a message is successfully sent, THE Messaging_System SHALL provide visual feedback

### Requirement 13: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and can take action.

#### Acceptance Criteria

1. IF a database query fails, THEN THE Messaging_System SHALL display a user-friendly error message
2. IF a real-time connection fails, THEN THE Messaging_System SHALL attempt to reconnect automatically
3. IF a message fails to send, THEN THE Messaging_System SHALL display an error and allow the user to retry
4. IF a conversation fails to load, THEN THE Messaging_System SHALL display an error message with a retry option
5. THE Messaging_System SHALL log all errors to the console for debugging purposes

### Requirement 14: Loading States

**User Story:** As a user, I want to see loading indicators, so that I know the system is working when data is being fetched.

#### Acceptance Criteria

1. WHILE conversations are being loaded, THE Messaging_System SHALL display a loading indicator
2. WHILE messages are being loaded, THE Messaging_System SHALL display a loading indicator
3. WHILE a message is being sent, THE Messaging_System SHALL display a sending indicator
4. WHEN data loading completes, THE Messaging_System SHALL remove the loading indicator
5. THE Messaging_System SHALL display loading states without blocking user interaction with other UI elements

### Requirement 15: Empty States

**User Story:** As a user, I want helpful messages when there's no data, so that I understand the current state of the system.

#### Acceptance Criteria

1. IF a user has no conversations, THEN THE Messaging_System SHALL display an empty state message
2. IF a conversation has no messages, THEN THE Messaging_System SHALL display an empty state message
3. THE Messaging_System SHALL provide actionable guidance in empty state messages
4. THE Messaging_System SHALL style empty states consistently with the application design
5. WHERE appropriate, THE Messaging_System SHALL include a call-to-action in empty states
