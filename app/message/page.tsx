'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import ErrorDisplay from '@/components/ErrorDisplay';
import { supabase } from '@/lib/supabase';
import { getConversations, getMessages, sendMessage, markMessagesAsRead, getOrCreateConversation, deleteConversation } from '@/lib/api/messaging';
import { subscribeToMessages, unsubscribeFromMessages, subscribeToConversationUpdates } from '@/lib/api/realtime';
import { formatTimestamp, getDisplayName, validateMessageContent } from '@/lib/utils/messaging';
import { ConversationWithDetails, MessageWithSender } from '@/lib/types/messaging';
import { RealtimeChannel } from '@supabase/supabase-js';

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null); // For new conversations
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const conversationChannelRef = useRef<RealtimeChannel | null>(null);
  const loadConversationsRef = useRef<(() => Promise<void>) | null>(null);

  // Function to manually refresh conversations
  const refreshConversations = async () => {
    if (!currentUserId) return;
    
    const { data, error: err } = await getConversations(currentUserId);
    
    if (!err && data) {
      setConversations(data);
    }
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }
      
      setCurrentUserId(user.id);
    };
    
    checkAuth();
  }, [router]);

  // Handle conversation query parameter and refresh conversations
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    const userId = searchParams.get('user');
    
    if (conversationId) {
      setSelectedConversation(conversationId);
      setTargetUserId(null);
      // Refresh conversations to show the new one
      refreshConversations();
    } else if (userId) {
      // New conversation mode - don't create until first message
      setTargetUserId(userId);
      setSelectedConversation('new');
    }
  }, [searchParams]);

  // Load conversations
  useEffect(() => {
    if (!currentUserId) return;

    const loadConversations = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: err } = await getConversations(currentUserId);
      
      if (err) {
        setError(err);
      } else {
        setConversations(data || []);
      }
      
      setLoading(false);
    };

    loadConversations();

    // Poll for conversation updates every 3 seconds
    const pollInterval = setInterval(() => {
      getConversations(currentUserId).then(({ data, error }) => {
        if (!error && data) {
          setConversations(data);
        }
      });
    }, 3000);

    // Subscribe to conversation updates (fallback if realtime is enabled)
    const channel = subscribeToConversationUpdates(currentUserId, () => {
      loadConversations();
    });
    conversationChannelRef.current = channel;

    return () => {
      clearInterval(pollInterval);
      if (conversationChannelRef.current) {
        unsubscribeFromMessages(conversationChannelRef.current);
      }
    };
  }, [currentUserId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;
    
    // Skip loading for new conversations
    if (selectedConversation === 'new') {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessageError(null);
      
      const { data, error: err } = await getMessages(selectedConversation);
      
      if (err) {
        setMessageError(err);
      } else {
        setMessages(data || []);
        // Mark messages as read
        await markMessagesAsRead(selectedConversation, currentUserId);
      }
      
      setLoadingMessages(false);
    };

    loadMessages();

    // Poll for new messages every 2 seconds
    const pollInterval = setInterval(() => {
      getMessages(selectedConversation).then(({ data, error }) => {
        if (!error && data) {
          setMessages(data);
          // Mark new messages as read
          markMessagesAsRead(selectedConversation, currentUserId);
        }
      });
    }, 2000);

    // Subscribe to new messages (fallback if realtime is enabled)
    const channel = subscribeToMessages(selectedConversation, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // Mark as read if not from current user
      if (newMessage.sender_id !== currentUserId) {
        markMessagesAsRead(selectedConversation, currentUserId);
      }
    });
    messageChannelRef.current = channel;

    return () => {
      clearInterval(pollInterval);
      if (messageChannelRef.current) {
        unsubscribeFromMessages(messageChannelRef.current);
      }
    };
  }, [selectedConversation, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const validation = validateMessageContent(messageText);
    if (!validation.isValid) {
      setMessageError(validation.errors[0]);
      return;
    }

    setSending(true);
    setMessageError(null);

    // If this is a new conversation, create it first
    let conversationId = selectedConversation;
    if (selectedConversation === 'new' && targetUserId) {
      const { data: newConvId, error: convError } = await getOrCreateConversation(currentUserId, targetUserId);
      
      if (convError || !newConvId) {
        setMessageError(convError || 'Failed to create conversation');
        setSending(false);
        return;
      }
      
      conversationId = newConvId;
      setSelectedConversation(newConvId);
      setTargetUserId(null);
      
      // Refresh conversations to show the new one
      await refreshConversations();
    }

    if (!conversationId || conversationId === 'new') {
      setMessageError('Invalid conversation');
      setSending(false);
      return;
    }

    const { data, error: err } = await sendMessage(conversationId, currentUserId, messageText);

    if (err) {
      setMessageError(err);
      setSending(false);
      return;
    }

    setMessageText('');
    setSending(false);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
    setMessageError(null);
  };

  const handleDeleteConversation = async (conversationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!currentUserId) return;
    
    setOpenMenuId(null); // Close menu
    
    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    setDeletingConversation(conversationId);
    
    const { error: deleteError } = await deleteConversation(conversationId, currentUserId);
    
    if (deleteError) {
      setError(deleteError);
      setDeletingConversation(null);
      return;
    }

    // If we're viewing this conversation, go back to list
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }

    // Refresh conversations immediately
    await refreshConversations();
    setDeletingConversation(null);
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#1a2c36] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (selectedConversation) {
    // Handle new conversation mode
    let conversation = null;
    let otherUserName = 'Unknown User';
    let otherUserEmail = '';
    let avatarUrl = null;
    let initials = 'U';
    
    if (selectedConversation === 'new' && targetUserId) {
      // New conversation - fetch target user info
      otherUserName = 'New Conversation';
      otherUserEmail = '';
    } else {
      conversation = conversations.find((c) => c.id === selectedConversation);
      otherUserName = conversation?.other_participant ? getDisplayName(conversation.other_participant) : 'Unknown User';
      otherUserEmail = conversation?.other_participant?.email || '';
      avatarUrl = conversation?.other_participant?.user_metadata?.avatar_url;
      initials = otherUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    const charCount = messageText.length;
    const isValid = charCount > 0 && charCount <= 5000;

    return (
      <div className="fixed inset-0 bg-[#1a2c36] flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
          {/* Header */}
          <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 flex items-center gap-4 flex-shrink-0">
            <button
              onClick={handleBackToList}
              className="text-white hover:text-[#5fa4c3] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex-shrink-0 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={otherUserName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white font-semibold text-sm">{initials}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                {otherUserName}
              </h1>
              <p className="text-xs text-gray-400">
                {otherUserEmail}
              </p>
            </div>
            {selectedConversation !== 'new' && (
              <button
                onClick={() => handleDeleteConversation(selectedConversation)}
                disabled={deletingConversation === selectedConversation}
                className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                title="Delete conversation"
              >
                {deletingConversation === selectedConversation ? (
                  <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading messages...</div>
              </div>
            ) : messageError ? (
              <ErrorDisplay 
                error={messageError} 
                onRetry={() => setSelectedConversation(selectedConversation)}
                onDismiss={() => setMessageError(null)}
              />
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === currentUserId;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${
                      isOwn 
                        ? 'bg-[#5fa4c3] text-white rounded-2xl rounded-tr-none' 
                        : 'bg-[#2d3f47] text-white rounded-2xl rounded-tl-none border border-[#3a4f5a]'
                    } px-4 py-2 max-w-xs`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                        {formatTimestamp(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="bg-[#2d3f47] border-t border-[#3a4f5a] p-4 flex-shrink-0">
            {charCount > 5000 && (
              <div className="text-red-400 text-xs mb-2">
                Message too long ({charCount}/5000 characters)
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-full bg-[#1a2c36] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isValid || sending}
                className="bg-[#5fa4c3] text-white rounded-full p-3 hover:bg-[#4a8fb5] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99021575 L3.03521743,10.4310088 C3.03521743,10.5881061 3.34915502,10.7452035 3.50612381,10.7452035 L16.6915026,11.5306905 C16.6915026,11.5306905 17.1624089,11.5306905 17.1624089,12.0019827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Messages</h1>
        </header>

        {/* Error Display */}
        {error && (
          <div className="p-4">
            <ErrorDisplay 
              error={error} 
              onRetry={() => window.location.reload()}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-400">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-400 text-center">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start chatting with other users!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#3a4f5a]">
            {conversations.map((conversation) => {
              const avatarUrl = conversation.other_participant?.user_metadata?.avatar_url;
              const displayName = conversation.other_participant ? getDisplayName(conversation.other_participant) : 'Unknown User';
              const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const isDeleting = deletingConversation === conversation.id;
              const isMenuOpen = openMenuId === conversation.id;
              
              return (
                <div key={conversation.id} className="relative">
                  <div className="flex items-start gap-3 p-4 hover:bg-[#2d3f47] transition-colors">
                    <button
                      onClick={() => setSelectedConversation(conversation.id)}
                      disabled={isDeleting}
                      className="flex items-start gap-3 flex-1 min-w-0 disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={displayName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">{initials}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            {displayName}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {conversation.last_message ? formatTimestamp(conversation.last_message.created_at) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {conversation.last_message?.content || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {conversation.unread_count > 0 && (
                        <div className="w-2 h-2 rounded-full bg-[#5fa4c3] flex-shrink-0" />
                      )}
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : conversation.id);
                          }}
                          disabled={isDeleting}
                          className="text-gray-400 hover:text-white transition-colors p-1 disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        
                        {isMenuOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-[#2d3f47] border border-[#3a4f5a] rounded-lg shadow-lg overflow-hidden min-w-[160px]">
                              <button
                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                disabled={isDeleting}
                                className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#1a2c36] transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}


export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a2c36] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}
