import { supabase } from "@/common/supabase";
import type { Conversation } from "@/types/social";

export class ConversationOperations {
  static async getConversations(
    userId: string,
  ): Promise<{ success: boolean; data: Conversation[] }> {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          participants:conversation_participants!conversations_id_fkey(
            user_id,
            profiles!conversation_participants_user_id_fkey(*)
          )
        `,
        )
        .contains("participants", [{ user_id: userId }])
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Failed to get conversations:", error);
      return { success: false, data: [] };
    }
  }

  static async markMessagesAsRead(
    userId: string,
    otherUserId: string,
  ): Promise<void> {
    return Promise.resolve();
  }

  static subscribeToMessages(userId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        },
      )
      .subscribe();
  }

  static subscribeToConversation(
    userId: string,
    otherUserId: string,
    callback: (message: any) => void,
  ) {
    return supabase
      .channel(`conversation:${userId}:${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId}))`,
        },
        (payload) => {
          callback(payload.new);
        },
      )
      .subscribe();
  }
}
