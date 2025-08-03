"use client";

import { useCallback, useEffect, useState } from "react";

import { ConversationOperations } from "@/common/operations/conversationOperations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { Conversation } from "@/types/social";

export function MessagesTab() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await ConversationOperations.getConversations(user.id);
      if (result.success) {
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [loadConversations, user?.id]);

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
        <Text>No conversations found.</Text>
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
            key={conversation.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <div>
                  <Text className="font-medium">
                    {conversation.participants?.[0]?.profiles?.first_name}{" "}
                    {conversation.participants?.[0]?.profiles?.last_name}
                  </Text>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    {conversation.last_message?.content || "No messages yet"}
                  </Text>
                </div>
              </div>
              <Button
                onClick={() => {
                  /* Navigate to conversation */
                }}
              >
                Open Chat
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
