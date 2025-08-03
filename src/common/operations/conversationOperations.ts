import type { Conversation, Message } from "@/types/social";
import { supabase } from "@/common/supabase";
import { conversationQueryValidator } from "@/common/validators/socialFeatureValidator";

export class ConversationOperations {
  static async getConversations(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Conversation[]> {
    const validatedData = conversationQueryValidator.parse({
      user_id: userId,
      limit,
      offset,
    });

    const { data: conversations, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        sender_id,
        receiver_id,
        content,
        loan_id,
        created_at,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `,
      )
      .or(
        `sender_id.eq.${validatedData.user_id},receiver_id.eq.${validatedData.user_id}`,
      )
      .order("created_at", { ascending: false })
      .limit(validatedData.limit)
      .range(
        validatedData.offset,
        validatedData.offset + validatedData.limit - 1,
      );

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    const conversationMap = new Map<string, Conversation>();

    conversations?.forEach((message) => {
      const otherUserId =
        message.sender_id === userId ? message.receiver_id : message.sender_id;
      const otherUser =
        message.sender_id === userId ? message.receiver : message.sender;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId,
          other_user: otherUser as any,
          last_message: message as any,
          created_at: message.created_at,
          updated_at: message.created_at,
        });
      } else {
        const conversation = conversationMap.get(otherUserId)!;
        if (
          !conversation.last_message ||
          new Date(message.created_at) >
            new Date(conversation.last_message.created_at)
        ) {
          conversation.last_message = message as any;
        }
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => {
      if (!a.last_message || !b.last_message) return 0;
      return (
        new Date(b.last_message.created_at).getTime() -
        new Date(a.last_message.created_at).getTime()
      );
    });
  }

  static async markMessagesAsRead(
    userId: string,
    otherUserId: string,
  ): Promise<void> {
    return Promise.resolve();
  }

  static subscribeToMessages(
    userId: string,
    callback: (message: Message) => void,
  ) {
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
          callback(payload.new as Message);
        },
      )
      .subscribe();
  }

  static subscribeToConversation(
    userId: string,
    otherUserId: string,
    callback: (message: Message) => void,
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
          callback(payload.new as Message);
        },
      )
      .subscribe();
  }
}
