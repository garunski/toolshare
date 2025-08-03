"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/common/hooks/useAuth";
import { MessageOperations } from "@/common/operations/messageOperations";
import { Text } from "@/primitives/text";
import type { Message } from "@/types/social";

interface MessageListProps {
  otherUserId: string;
}

export function MessageList({ otherUserId }: MessageListProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await MessageOperations.getMessages(user.id, otherUserId);
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, otherUserId]);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [loadMessages, user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Text>Loading messages...</Text>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <Text>No messages yet. Start a conversation!</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender_id === user?.id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs rounded-lg px-4 py-2 ${
              message.sender_id === user?.id
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
            }`}
          >
            <Text className="text-sm">{message.content}</Text>
            <Text className="text-xs opacity-70">
              {new Date(message.created_at).toLocaleTimeString()}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}
