import { supabase } from '../supabase';
import { ConversationWithDetails, MessageWithSender, ApiResponse } from '../types/messaging';
import { handleDatabaseOperation } from '../utils/errors';
import { validateMessageContent } from '../utils/messaging';

// Get or create a conversation between two users
export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string
): Promise<ApiResponse<string>> {
  try {
    // Ensure participant_one_id is always the lower UUID
    const [participantOne, participantTwo] = 
      currentUserId < otherUserId 
        ? [currentUserId, otherUserId]
        : [otherUserId, currentUserId];

    // Check if conversation exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_one_id', participantOne)
      .eq('participant_two_id', participantTwo)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      return { data: null, error: 'Failed to check for existing conversation' };
    }

    if (existing) {
      return { data: existing.id, error: null };
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant_one_id: participantOne,
        participant_two_id: participantTwo,
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return { data: null, error: 'Failed to create conversation' };
    }

    return { data: newConv.id, error: null };
  } catch (err) {
    console.error('Unexpected error in getOrCreateConversation:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get all conversations for the current user
export async function getConversations(
  currentUserId: string
): Promise<ApiResponse<ConversationWithDetails[]>> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_one_id.eq.${currentUserId},participant_two_id.eq.${currentUserId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return { data: null, error: 'Failed to load conversations' };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // Fetch additional details for each conversation
    const conversationsWithDetails = await Promise.all(
      data.map(async (conv) => {
        const otherUserId = 
          conv.participant_one_id === currentUserId
            ? conv.participant_two_id
            : conv.participant_one_id;

        // Get other participant details from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();
        
        // Format user data
        let otherParticipant = null;
        if (profileData) {
          const displayName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
            || profileData.username 
            || 'Unknown User';
          
          otherParticipant = {
            id: profileData.id,
            email: profileData.username || '', // Use username as fallback
            user_metadata: {
              full_name: displayName,
              username: profileData.username,
              avatar_url: profileData.avatar_url,
            },
          };
        }

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', currentUserId)
          .is('read_at', null);

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message: lastMessage,
          unread_count: unreadCount || 0,
        };
      })
    );

    return { data: conversationsWithDetails, error: null };
  } catch (err) {
    console.error('Unexpected error in getConversations:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<ApiResponse<MessageWithSender>> {
  // Validate content
  const validation = validateMessageContent(content);
  if (!validation.isValid) {
    return { data: null, error: validation.errors[0] };
  }

  const trimmedContent = content.trim();

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmedContent,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error: 'Failed to send message' };
    }

    return { data: data as MessageWithSender, error: null };
  } catch (err) {
    console.error('Unexpected error in sendMessage:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string
): Promise<ApiResponse<MessageWithSender[]>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return { data: null, error: 'Failed to load messages' };
    }

    return { data: (data || []) as MessageWithSender[], error: null };
  } catch (err) {
    console.error('Unexpected error in getMessages:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  currentUserId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);

    if (error) {
      console.error('Error marking messages as read:', error);
      return { data: null, error: 'Failed to mark messages as read' };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Unexpected error in markMessagesAsRead:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Delete a conversation
export async function deleteConversation(
  conversationId: string,
  currentUserId: string
): Promise<ApiResponse<void>> {
  try {
    // Verify user is a participant
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('participant_one_id, participant_two_id')
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      return { data: null, error: 'Conversation not found' };
    }

    if (conversation.participant_one_id !== currentUserId && 
        conversation.participant_two_id !== currentUserId) {
      return { data: null, error: 'Unauthorized to delete this conversation' };
    }

    // Delete the conversation (messages will cascade delete)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return { data: null, error: 'Failed to delete conversation' };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Unexpected error in deleteConversation:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
