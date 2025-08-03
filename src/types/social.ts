export interface SocialProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialStats {
  total_friends: number;
  total_loans: number;
  average_rating: number;
  trust_score: number;
}

export interface Conversation {
  id: string;
  other_user: SocialProfile;
  last_message?: Message;
  participants?: Array<{
    user_id: string;
    profiles?: SocialProfile;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: SocialProfile;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
  sender?: SocialProfile;
  receiver?: SocialProfile;
}

export interface SocialConnection {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: SocialProfile;
}

export interface FriendRequestFormData {
  receiver_id: string;
  message?: string;
}
