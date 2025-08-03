"use client";

import { useState, useEffect } from "react";

import { MessageThreadHandler } from "@/common/operations/messageThreadHandler";
import { useAuth } from "@/hooks/useAuth";
import type { Message, SocialProfile } from "@/types/social";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export function MessagesTab() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Array<{ user: SocialProfile; lastMessage: Message }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const result = await MessageThreadHandler.getConversations(user.id);
      if (result.success) {
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading conversations...</Text>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No conversations yet. Start messaging your friends!</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Messages
      </Heading>
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.user.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <div>
                  <Text className="font-medium">
                    {conversation.user.first_name} {conversation.user.last_name}
                  </Text>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    {conversation.lastMessage.content}
                  </Text>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {/* Navigate to conversation */}}
              >
                Open
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
