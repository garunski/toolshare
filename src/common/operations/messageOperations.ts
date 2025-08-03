import { supabase } from "@/common/supabase";
import type { Message } from "@/types/social";

export class MessageOperations {
  static async getMessages(
    userId: string,
    otherUserId: string,
  ): Promise<{ success: boolean; data: Message[] }> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `sender_id.eq.${userId}.and.receiver_id.eq.${otherUserId},sender_id.eq.${otherUserId}.and.receiver_id.eq.${userId}`,
        )
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Failed to get messages:", error);
      return { success: false, data: [] };
    }
  }

  static async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<{ success: boolean; data: Message }> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Failed to send message:", error);
      return { success: false, data: null as any };
    }
  }

  static async getLoanMessages(
    loanId: string,
    userId: string,
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `,
      )
      .eq("loan_id", loanId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch loan messages: ${error.message}`);
    }

    return data || [];
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", userId);

    if (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }
}
