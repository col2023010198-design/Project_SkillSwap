import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { MessageWithSender } from '../types/messaging';

// Subscribe to new messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: MessageWithSender) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const message = payload.new as MessageWithSender;
        onMessage(message);
      }
    )
    .subscribe();

  return channel;
}

// Unsubscribe from a channel
export function unsubscribeFromMessages(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

// Subscribe to conversation updates (for unread counts)
export function subscribeToConversationUpdates(
  userId: string,
  onUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      () => {
        // Trigger conversation list refresh
        onUpdate();
      }
    )
    .subscribe();

  return channel;
}

// Subscribe with retry logic
export function subscribeWithRetry(
  conversationId: string,
  onMessage: (message: MessageWithSender) => void,
  maxRetries: number = 3
): RealtimeChannel {
  let retryCount = 0;
  
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        try {
          const message = payload.new as MessageWithSender;
          onMessage(message);
        } catch (err) {
          console.error('Error processing real-time message:', err);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Real-time channel error:', err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
          
          setTimeout(() => {
            channel.subscribe();
          }, 1000 * retryCount); // Exponential backoff
        } else {
          console.error('Max retries reached. Real-time updates disabled.');
        }
      }
      
      if (status === 'SUBSCRIBED') {
        retryCount = 0; // Reset on successful connection
      }
    });
  
  return channel;
}
