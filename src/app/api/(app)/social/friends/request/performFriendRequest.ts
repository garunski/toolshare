import { createClient } from "@/common/supabase/client";
import type { SocialConnection, SocialProfile } from "@/types/social";

export class PerformFriendRequest {
  static async getFriends(userId: string): Promise<SocialConnection[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("social_connections")
      .select(
        `
        *,
        friend:profiles!social_connections_friend_id_fkey(*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch friends: ${error.message}`);
    }

    return data || [];
  }

  static async removeFriend(userId: string, friendId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("social_connections")
      .delete()
      .or(
        `user_id.eq.${userId}.and.friend_id.eq.${friendId},user_id.eq.${friendId}.and.friend_id.eq.${userId}`,
      );

    if (error) {
      throw new Error(`Failed to remove friend: ${error.message}`);
    }
  }

  static async searchUsers(
    query: string,
    currentUserId: string,
    limit = 10,
  ): Promise<SocialProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq("id", currentUserId)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    return data || [];
  }

  static async getSuggestedFriends(
    userId: string,
    limit = 5,
  ): Promise<SocialProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get suggested friends: ${error.message}`);
    }

    return data || [];
  }

  static async checkFriendshipStatus(
    userId: string,
    otherUserId: string,
  ): Promise<"friends" | "pending_sent" | "pending_received" | "none"> {
    const supabase = createClient();
    const { data: connection } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("friend_id", otherUserId)
      .single();

    if (connection) {
      return "friends";
    }

    const { data: sentRequest } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", userId)
      .eq("receiver_id", otherUserId)
      .eq("status", "pending")
      .single();

    if (sentRequest) {
      return "pending_sent";
    }

    const { data: receivedRequest } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", otherUserId)
      .eq("receiver_id", userId)
      .eq("status", "pending")
      .single();

    if (receivedRequest) {
      return "pending_received";
    }

    return "none";
  }

  static async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
    });

    if (error) {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }
  }

  static async getProfile(userId: string): Promise<SocialProfile> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }

    return data;
  }
}
