"use client";

import { useState, useEffect } from "react";

import { MessageThreadHandler } from "@/common/operations/messageThreadHandler";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@/types/social";
import { Text } from "@/primitives/text";

interface MessageListProps {
  userId: string;
  otherUserId: string;
}

export function MessageList({ userId, otherUserId }: MessageListProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user?.id, otherUserId]);

  const loadMessages = async () => {
    if (!user?.id) return;

    try {
      const result = await MessageThreadHandler.getMessages(userId, otherUserId);
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <Text>Loading messages...</Text>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <Text className="text-center text-zinc-500">No messages yet. Start the conversation!</Text>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs rounded-lg px-4 py-2 ${
              message.sender_id === userId
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white'
            }`}
          >
            <Text className="text-sm">{message.content}</Text>
            <Text className="text-xs opacity-70 mt-1">
              {new Date(message.created_at).toLocaleTimeString()}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}
