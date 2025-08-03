"use client";

import { Avatar } from "@/primitives/avatar";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import type { Conversation } from "@/types/social";

interface MessagesTabProps {
  conversations: Conversation[];
}

export function MessagesTab({ conversations }: MessagesTabProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4">
        <Heading level={3} className="text-lg font-semibold">
          Conversations ({conversations.length})
        </Heading>
      </div>
      <div>
        {conversations.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
            <Text>No conversations yet</Text>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    initials={`${conversation.other_user.first_name[0]}${conversation.other_user.last_name[0]}`}
                  />
                  <div>
                    <Text className="font-medium text-zinc-900 dark:text-white">
                      {conversation.other_user.first_name}{" "}
                      {conversation.other_user.last_name}
                    </Text>
                    {conversation.last_message && (
                      <Text className="max-w-xs truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {conversation.last_message.content}
                      </Text>
                    )}
                  </div>
                </div>
                <Button outline>Open</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
