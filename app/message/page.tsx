'use client';

import { useState } from 'react';
import Link from 'next/link'; 
import BottomNav from '@/components/BottomNav';

interface Message {
  id: string;
  sender: string;
  senderUsername: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const conversations: Message[] = [
  {
    id: '1',
    sender: 'Ron Hansen Person',
    senderUsername: 'ronhansen',
    lastMessage: 'Thanks for the tips! Really helpful.',
    timestamp: '2 min ago',
    unread: true,
  },
  {
    id: '2',
    sender: 'Sarah Mitchell',
    senderUsername: 'sarahmitch',
    lastMessage: 'Can we schedule a session for Python?',
    timestamp: '1 hour ago',
    unread: false,
  },
  {
    id: '3',
    sender: 'David Chen',
    senderUsername: 'davidchen',
    lastMessage: 'Your React course was amazing!',
    timestamp: '5 hours ago',
    unread: false,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  if (selectedConversation) {
    const conversation = conversations.find((c) => c.id === selectedConversation);

    return (
      <div className="min-h-screen bg-[#1a2c36] pb-24">
        <div className="max-w-2xl mx-auto flex flex-col h-screen">
          {/* Header */}
          <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 flex items-center gap-4 sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold text-white">{conversation?.sender}</h1>
              <p className="text-xs text-gray-400">@{conversation?.senderUsername}</p>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex justify-end">
              <div className="bg-[#5fa4c3] text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-xs">
                <p className="text-sm">Hey! Want to learn React?</p>
                <p className="text-xs text-blue-100 mt-1">2:30 PM</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-[#2d3f47] text-white rounded-2xl rounded-tl-none px-4 py-2 max-w-xs border border-[#3a4f5a]">
                <p className="text-sm">{conversation?.lastMessage}</p>
                <p className="text-xs text-gray-400 mt-1">2:35 PM</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="bg-[#2d3f47] border-t border-[#3a4f5a] p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full bg-[#1a2c36] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              />
              <button
                type="submit"
                className="bg-[#5fa4c3] text-white rounded-full p-3 hover:bg-[#4a8fb5] transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99021575 L3.03521743,10.4310088 C3.03521743,10.5881061 3.34915502,10.7452035 3.50612381,10.7452035 L16.6915026,11.5306905 C16.6915026,11.5306905 17.1624089,11.5306905 17.1624089,12.0019827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button className="text-gray-400 hover:text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </button>
        </header>

        {/* Conversations */}
        <div className="divide-y divide-[#3a4f5a]">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className="w-full text-left p-4 hover:bg-[#2d3f47] transition-colors border-b border-[#3a4f5a] last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{conversation.sender}</h3>
                    <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread && <div className="w-2 h-2 rounded-full bg-[#5fa4c3] flex-shrink-0 mt-2" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}