import type { Conversation, Message } from "../../types/social";

export class ConversationFormatter {
  static formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes === 0 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  static formatConversationPreview(conversation: Conversation): string {
    if (!conversation.last_message) {
      return "No messages yet";
    }

    const message = conversation.last_message.content;
    const maxLength = 50;

    if (message.length <= maxLength) {
      return message;
    }

    return message.substring(0, maxLength) + "...";
  }

  static formatMessageContent(content: string): string {
    // Basic formatting for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(
      urlRegex,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );
  }

  static groupMessagesByDate(
    messages: Message[],
  ): { date: string; messages: Message[] }[] {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups)
      .map(([date, messages]) => ({ date, messages }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static formatDateHeader(date: string): string {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  static getUnreadCount(conversation: Conversation): number {
    return 0; // TODO: Implement unread count logic
  }

  static isMessageFromCurrentUser(
    message: Message,
    currentUserId: string,
  ): boolean {
    return message.sender_id === currentUserId;
  }

  static formatTypingIndicator(users: string[]): string {
    if (users.length === 0) return "";
    if (users.length === 1) return `${users[0]} is typing...`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`;
    return "Several people are typing...";
  }

  static sanitizeMessageContent(content: string): string {
    // Remove potentially harmful HTML/script tags
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }

  static truncateMessage(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + "...";
  }
}
