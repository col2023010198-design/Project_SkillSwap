# Implementation Plan: Messaging Module with Supabase

## Overview

This implementation plan breaks down the messaging module into discrete, sequential tasks that build upon each other. The implementation follows a bottom-up approach: database schema first, then API functions, then UI components, with testing integrated throughout. Each task is designed to be independently verifiable and includes references to specific requirements.

## Tasks

- [ ] 1. Set up database schema and security
  - [x] 1.1 Create conversations table with constraints and indexes
    - Create conversations table with id, participant_one_id, participant_two_id, created_at, updated_at columns
    - Add CHECK constraint to ensure participant_one_id < participant_two_id
    - Add UNIQUE constraint on (participant_one_id, participant_two_id)
    - Create indexes on participant_one_id, participant_two_id, and updated_at
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Create messages table with constraints and indexes
    - Create messages table with id, conversation_id, sender_id, content, created_at, read_at columns
    - Add foreign key to conversations with CASCADE DELETE
    - Add CHECK constraint for content length (1-5000 characters)
    - Create indexes on conversation_id, created_at, sender_id, and read_at
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.3 Implement Row Level Security policies
    - Enable RLS on conversations and messages tables
    - Create policy for users to view their conversations
    - Create policy for users to create conversations they participate in
    - Create policy for users to view messages in their conversations
    - Create policy for users to send messages in their conversations
    - Create policy for users to update read_at on received messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 1.4 Create database trigger for conversation timestamp updates
    - Create function update_conversation_timestamp()
    - Create trigger to update conversation.updated_at when message is inserted
    - _Requirements: 6.4_

  - [ ]* 1.5 Write property tests for database integrity
    - **Property 1: Foreign Key Enforcement for Participants**
    - **Property 2: Foreign Key Enforcement for Messages**
    - **Property 3: Conversation Uniqueness**
    - **Property 4: Cascade Delete Behavior**
    - **Property 5: Message Content Validation**
    - **Property 6: Participant Ordering Invariant**
    - **Validates: Requirements 1.2, 1.3, 1.4, 2.2, 2.3, 2.6, 5.4, 6.1, 6.2**

  - [ ]* 1.6 Write property tests for RLS policies
    - **Property 7: Conversation Read Authorization**
    - **Property 8: Conversation Creation Authorization**
    - **Property 9: Message Read Authorization**
    - **Property 10: Message Send Authorization**
    - **Property 11: Read Status Update Authorization**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7, 9.3**

- [x] 2. Create TypeScript types and interfaces
  - [x] 2.1 Define database types and application interfaces
    - Create Database interface with Tables definitions for conversations and messages
    - Create ConversationWithDetails interface
    - Create MessageWithSender interface
    - Create MessageInput and ConversationInput interfaces
    - Create validation result interfaces
    - _Requirements: All requirements (type safety foundation)_

- [x] 3. Implement conversation management functions
  - [x] 3.1 Implement getOrCreateConversation function
    - Ensure participant_one_id is always the lower UUID
    - Check if conversation exists between two users
    - Create new conversation if it doesn't exist
    - Return conversation ID
    - Include error handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 3.2 Implement getConversations function
    - Query conversations where user is a participant
    - Fetch other participant details for each conversation
    - Fetch last message for each conversation
    - Calculate unread count for each conversation
    - Order by updated_at descending
    - Include error handling
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.3 Write property tests for conversation management
    - **Property 18: Get-or-Create Idempotence**
    - **Property 19: Conversation Creation Returns Valid ID**
    - **Property 12: Conversation List Completeness**
    - **Property 13: Conversation Data Completeness**
    - **Property 14: Conversation Ordering**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.5**

  - [ ]* 3.4 Write unit tests for conversation edge cases
    - Test empty conversation list
    - Test conversation with no messages
    - Test error handling for failed queries
    - _Requirements: 4.6, 13.1, 13.4, 15.1_

- [x] 4. Implement message management functions
  - [x] 4.1 Implement sendMessage function
    - Validate message content (trim, length check)
    - Insert message into database
    - Return message with sender details
    - Include error handling
    - _Requirements: 6.1, 6.2, 6.3, 12.4_

  - [x] 4.2 Implement getMessages function
    - Query messages for a conversation
    - Order by created_at ascending
    - Include sender information
    - Include error handling
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 4.3 Implement markMessagesAsRead function
    - Update read_at for unread messages where user is recipient
    - Only update messages in specified conversation
    - Include error handling
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 4.4 Write property tests for message operations
    - **Property 20: Message Persistence**
    - **Property 21: Conversation Timestamp Update**
    - **Property 22: Message Input Normalization**
    - **Property 15: Message List Completeness**
    - **Property 16: Message Ordering**
    - **Property 17: Unread Count Accuracy**
    - **Property 26: Mark as Read on Open**
    - **Property 27: Read Status Invariant**
    - **Property 28: Unread Count Consistency**
    - **Validates: Requirements 6.3, 6.4, 7.1, 7.2, 7.3, 9.1, 9.2, 9.3, 9.4, 10.2, 12.4**

  - [ ]* 4.5 Write unit tests for message validation and errors
    - Test empty message rejection
    - Test oversized message rejection
    - Test whitespace trimming
    - Test failed send with retry option
    - _Requirements: 6.1, 6.2, 6.6, 12.4, 13.3_

- [ ] 5. Checkpoint - Verify database and API functions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement real-time subscription functions
  - [x] 6.1 Implement subscribeToMessages function
    - Create Supabase channel for conversation
    - Subscribe to INSERT events on messages table
    - Filter by conversation_id
    - Fetch sender details for new messages
    - Call callback with enriched message
    - Include error handling
    - _Requirements: 8.1, 8.2_

  - [x] 6.2 Implement unsubscribeFromMessages function
    - Remove channel from Supabase client
    - Clean up resources
    - _Requirements: 8.4_

  - [x] 6.3 Implement subscribeToConversationUpdates function
    - Create channel for conversation list updates
    - Subscribe to all events on messages table
    - Trigger callback to refresh conversation list
    - Include error handling
    - _Requirements: 8.2, 10.4_

  - [x] 6.4 Add real-time connection retry logic
    - Implement exponential backoff for failed connections
    - Add maximum retry limit
    - Display user notification when max retries reached
    - Reset retry count on successful connection
    - _Requirements: 8.5, 13.2_

  - [ ]* 6.5 Write property tests for real-time functionality
    - **Property 23: Real-Time Message Delivery**
    - **Property 24: Real-Time UI Update**
    - **Property 25: Real-Time Error Resilience**
    - **Validates: Requirements 8.2, 8.3, 8.5**

  - [ ]* 6.6 Write unit tests for subscription lifecycle
    - Test subscription on component mount
    - Test unsubscription on component unmount
    - Test connection error handling
    - Test retry mechanism
    - _Requirements: 8.4, 8.5, 13.2_

- [ ] 7. Implement validation and utility functions
  - [x] 7.1 Create message content validation function
    - Check for empty content
    - Check for content exceeding 5000 characters
    - Return validation result with error message
    - _Requirements: 6.1, 6.2, 12.1, 12.2, 12.3_

  - [x] 7.2 Create timestamp formatting function
    - Format relative timestamps (just now, X min ago, X hours ago, X days ago)
    - Fall back to date format for older messages
    - _Requirements: 7.6_

  - [x] 7.3 Create user display name helper function
    - Return full_name if available
    - Fall back to username if available
    - Fall back to email prefix
    - _Requirements: 4.2_

  - [x] 7.4 Create authentication wrapper function
    - Get current user from Supabase auth
    - Redirect to login if not authenticated
    - Execute operation with user ID
    - Handle token expiration
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [ ]* 7.5 Write unit tests for validation functions
    - Test message validation with various inputs
    - Test timestamp formatting edge cases
    - Test display name fallback logic
    - _Requirements: 6.1, 6.2, 7.6, 12.1, 12.2, 12.3_

- [x] 8. Implement error handling utilities
  - [x] 8.1 Create database error handler
    - Map PostgreSQL error codes to user-friendly messages
    - Log errors to console
    - Return standardized error format
    - _Requirements: 13.1, 13.5_

  - [x] 8.2 Create ErrorDisplay component
    - Display error message with icon
    - Show retry button when applicable
    - Show dismiss button when applicable
    - Style consistently with app design
    - _Requirements: 13.1, 13.3, 13.4_

  - [ ]* 8.3 Write unit tests for error handling
    - Test error message mapping
    - Test ErrorDisplay component rendering
    - Test retry and dismiss actions
    - _Requirements: 13.1, 13.3, 13.4, 13.5_

- [ ] 9. Checkpoint - Verify utilities and error handling
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement ConversationList component
  - [ ] 10.1 Create ConversationList component structure
    - Set up component with state for conversations, loading, error
    - Implement useEffect to fetch conversations on mount
    - Implement authentication check
    - Add loading state display
    - Add error state display with retry
    - Add empty state display
    - _Requirements: 4.1, 11.2, 14.1, 14.4, 15.1_

  - [ ] 10.2 Implement conversation list rendering
    - Map conversations to list items
    - Display other participant's name and avatar
    - Display last message preview
    - Display timestamp
    - Display unread indicator when unread_count > 0
    - Order by most recent
    - Handle conversation selection
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 10.1, 10.3_

  - [ ] 10.3 Add real-time updates to ConversationList
    - Subscribe to conversation updates on mount
    - Refresh conversation list when updates received
    - Unsubscribe on unmount
    - Update unread indicators in real-time
    - _Requirements: 8.1, 8.4, 10.4_

  - [ ]* 10.4 Write property tests for ConversationList
    - **Property 31: Unread Indicator Display**
    - **Property 32: Real-Time Unread Indicator Update**
    - **Property 37: Loading State Display**
    - **Property 38: Authentication Guard**
    - **Property 39: Authenticated User ID Consistency**
    - **Validates: Requirements 4.1, 8.1, 10.1, 10.3, 10.4, 11.2, 11.3, 14.1, 14.4**

  - [ ]* 10.5 Write unit tests for ConversationList
    - Test empty conversation list display
    - Test loading state
    - Test error state with retry
    - Test conversation selection
    - Test real-time subscription lifecycle
    - _Requirements: 4.6, 8.4, 13.4, 14.1, 14.4, 15.1_

- [ ] 11. Implement MessageThread component
  - [ ] 11.1 Create MessageThread component structure
    - Set up component with state for messages, loading, error, sending
    - Accept conversationId and currentUserId as props
    - Implement useEffect to fetch messages on mount
    - Add loading state display
    - Add error state display with retry
    - Add empty state display
    - _Requirements: 7.1, 14.2, 14.4, 15.2_

  - [ ] 11.2 Implement message list rendering
    - Map messages to message bubbles
    - Align sent messages (currentUserId) to the right
    - Align received messages to the left
    - Display sender information for received messages
    - Format and display timestamps
    - Auto-scroll to bottom on new messages
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 11.3 Add real-time message subscription
    - Subscribe to messages for conversation on mount
    - Append new messages to list when received
    - Unsubscribe on unmount
    - Handle subscription errors gracefully
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 11.4 Implement mark as read functionality
    - Call markMessagesAsRead when conversation is opened
    - Update read status without page refresh
    - _Requirements: 9.1, 9.5_

  - [ ]* 11.5 Write property tests for MessageThread
    - **Property 29: Message Alignment**
    - **Property 30: Timestamp Formatting**
    - **Property 37: Loading State Display**
    - **Validates: Requirements 7.4, 7.5, 7.6, 14.2, 14.4**

  - [ ]* 11.6 Write unit tests for MessageThread
    - Test empty message list display
    - Test loading state
    - Test error state with retry
    - Test message alignment logic
    - Test real-time subscription lifecycle
    - Test mark as read on open
    - _Requirements: 7.4, 7.5, 8.4, 9.1, 14.2, 14.4, 15.2_

- [ ] 12. Implement MessageInput component
  - [ ] 12.1 Create MessageInput component structure
    - Set up component with state for content, charCount, isValid, isSending
    - Accept conversationId and currentUserId as props
    - Accept onMessageSent callback prop
    - Create form with input and send button
    - _Requirements: 6.5, 12.4_

  - [ ] 12.2 Implement input validation and character count
    - Update charCount on input change
    - Validate content on change (trim, length check)
    - Disable send button when content is empty
    - Disable send button when content exceeds 5000 characters
    - Display character count warning when exceeding limit
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ] 12.3 Implement message sending
    - Call sendMessage on form submit
    - Show sending indicator while in progress
    - Clear input on successful send
    - Preserve input on failed send
    - Display error message on failure with retry option
    - Call onMessageSent callback on success
    - Provide visual feedback on success
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 12.5, 13.3, 14.3_

  - [ ]* 12.4 Write property tests for MessageInput
    - **Property 33: Send Button State - Empty Input**
    - **Property 34: Send Button State - Length Exceeded**
    - **Property 35: Character Count Warning**
    - **Property 36: Input Clear on Send**
    - **Validates: Requirements 6.5, 12.1, 12.2, 12.3**

  - [ ]* 12.5 Write unit tests for MessageInput
    - Test send button disabled when empty
    - Test send button disabled when too long
    - Test character count display
    - Test successful send clears input
    - Test failed send preserves input
    - Test error display with retry
    - _Requirements: 6.5, 6.6, 12.1, 12.2, 12.3, 13.3_

- [ ] 13. Checkpoint - Verify all components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Integrate components into messaging page
  - [x] 14.1 Update app/message/page.tsx to use real components
    - Replace static data with ConversationList component
    - Replace static message view with MessageThread component
    - Replace static input with MessageInput component
    - Implement conversation selection state management
    - Add back button to return to conversation list
    - Maintain existing styling and layout
    - _Requirements: All requirements (integration)_

  - [x] 14.2 Add authentication integration
    - Get current user from Supabase auth
    - Redirect to login if not authenticated
    - Pass user ID to all components
    - Handle logout and clear cached data
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 14.3 Add global error boundary
    - Wrap messaging page in error boundary
    - Display fallback UI on critical errors
    - Log errors for debugging
    - _Requirements: 13.5_

  - [ ]* 14.4 Write integration tests for complete flow
    - Test sending message and receiving via real-time
    - Test conversation creation flow
    - Test mark as read flow
    - Test unread count updates
    - Test authentication flow
    - _Requirements: 6.3, 8.2, 9.1, 9.4, 11.2_

- [x] 15. Create database migration file
  - [x] 15.1 Create SQL migration file with all schema changes
    - Include conversations table creation
    - Include messages table creation
    - Include all indexes
    - Include all RLS policies
    - Include trigger function and trigger
    - Add rollback statements
    - Document migration steps
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.4_

- [ ] 16. Final checkpoint and documentation
  - [x] 16.1 Run all tests and verify functionality
    - Run unit tests
    - Run property tests
    - Run integration tests
    - Verify all tests pass
    - _Requirements: All requirements_

  - [x] 16.2 Create README for messaging module
    - Document setup instructions
    - Document database migration steps
    - Document environment variables needed
    - Document component usage
    - Document testing approach
    - _Requirements: All requirements (documentation)_

  - [x] 16.3 Final verification
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation uses TypeScript for type safety throughout
- Real-time functionality is built on Supabase subscriptions
- All database operations are protected by Row Level Security policies
- Error handling is comprehensive with user-friendly messages and retry options
