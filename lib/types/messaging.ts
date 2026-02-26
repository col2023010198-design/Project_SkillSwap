// Database types
export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          participant_one_id: string;
          participant_two_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_one_id: string;
          participant_two_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_one_id?: string;
          participant_two_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
          read_at?: string | null;
        };
      };
    };
  };
}

// Application types
export interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface ConversationWithDetails {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  created_at: string;
  updated_at: string;
  other_participant: UserProfile | null;
  last_message: {
    content: string;
    created_at: string;
  } | null;
  unread_count: number;
}

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: UserProfile;
}

export interface MessageInput {
  content: string;
  conversation_id: string;
}

export interface ConversationInput {
  other_user_id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
