import type { Message } from "@/types/social";
import { supabase } from "@/common/supabase";
import { messageValidator } from "@/common/validators/socialFeatureValidator";

export class MessageOperations {
  static async sendMessage(
    data: { receiver_id: string; content: string; loan_id?: string },
    senderId: string,
  ): Promise<Message> {
    const validatedData = messageValidator.parse(data);

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        sender_id: senderId,
        receiver_id: validatedData.receiver_id,
        content: validatedData.content,
        loan_id: validatedData.loan_id,
      })
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return message;
  }

  static async getMessages(
    userId: string,
    otherUserId: string,
    limit = 50,
    offset = 0,
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
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`,
      )
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return (data || []).reverse();
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
