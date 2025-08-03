import type { Conversation, Message } from "@/types/social";

import { ConversationOperations } from "./conversationOperations";
import { MessageOperations } from "./messageOperations";

export class MessageThreadHandler {
  static async sendMessage(
    data: { receiver_id: string; content: string; loan_id?: string },
    senderId: string,
  ): Promise<Message> {
    return MessageOperations.sendMessage(data, senderId);
  }

  static async getConversations(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Conversation[]> {
    return ConversationOperations.getConversations(userId, limit, offset);
  }

  static async getMessages(
    userId: string,
    otherUserId: string,
    limit = 50,
    offset = 0,
  ): Promise<Message[]> {
    return MessageOperations.getMessages(userId, otherUserId, limit, offset);
  }

  static async getLoanMessages(
    loanId: string,
    userId: string,
  ): Promise<Message[]> {
    return MessageOperations.getLoanMessages(loanId, userId);
  }

  static async markMessagesAsRead(
    userId: string,
    otherUserId: string,
  ): Promise<void> {
    return ConversationOperations.markMessagesAsRead(userId, otherUserId);
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    return MessageOperations.deleteMessage(messageId, userId);
  }

  static subscribeToMessages(
    userId: string,
    callback: (message: Message) => void,
  ) {
    return ConversationOperations.subscribeToMessages(userId, callback);
  }

  static subscribeToConversation(
    userId: string,
    otherUserId: string,
    callback: (message: Message) => void,
  ) {
    return ConversationOperations.subscribeToConversation(
      userId,
      otherUserId,
      callback,
    );
  }
}
