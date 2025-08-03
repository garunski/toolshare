"use client";

import { useEffect, useRef } from "react";

import { Avatar } from "@/primitives/avatar";
import { Badge } from "@/primitives/badge";
import { Text } from "@/primitives/text";

import { ConversationFormatter } from "../../../../../common/formatters/conversationFormatter";
import type { Message } from "../../../../../types/social";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = ConversationFormatter.groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        <Text>No messages yet</Text>
        <Text className="text-sm">
          Start the conversation by sending a message!
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedMessages.map(({ date, messages: dayMessages }) => (
        <div key={date}>
          <div className="mb-4 text-center">
            <Badge color="zinc" className="text-xs">
              {ConversationFormatter.formatDateHeader(date)}
            </Badge>
          </div>

          <div className="space-y-4">
            {dayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${ConversationFormatter.isMessageFromCurrentUser(message, currentUserId) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${ConversationFormatter.isMessageFromCurrentUser(message, currentUserId) ? "order-2" : "order-1"}`}
                >
                  {!ConversationFormatter.isMessageFromCurrentUser(
                    message,
                    currentUserId,
                  ) && (
                    <div className="mb-1 flex items-center space-x-2">
                      <Avatar
                        initials={`${message.sender?.first_name[0]}${message.sender?.last_name[0]}`}
                      />
                      <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                        {message.sender?.first_name} {message.sender?.last_name}
                      </Text>
                    </div>
                  )}

                  <div
                    className={`rounded-lg p-3 ${
                      ConversationFormatter.isMessageFromCurrentUser(
                        message,
                        currentUserId,
                      )
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    <Text className="text-sm">
                      {ConversationFormatter.sanitizeMessageContent(
                        message.content,
                      )}
                    </Text>
                    <Text
                      className={`mt-1 text-xs ${
                        ConversationFormatter.isMessageFromCurrentUser(
                          message,
                          currentUserId,
                        )
                          ? "text-blue-100"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {ConversationFormatter.formatMessageTime(
                        message.created_at,
                      )}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
