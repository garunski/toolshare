"use client";

import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";

import type { Message } from "../../../../../types/social";

import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface MessageContainerProps {
  messages: Message[];
  currentUserId: string;
  newMessage: string;
  sending: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function MessageContainer({
  messages,
  currentUserId,
  newMessage,
  sending,
  onMessageChange,
  onSendMessage,
  onKeyPress,
}: MessageContainerProps) {
  return (
    <div className="flex h-[600px] flex-col rounded-lg border border-zinc-950/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <Heading level={3} className="text-lg font-semibold">
            Conversation
          </Heading>
          <Badge color="zinc">{messages.length} messages</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      <MessageInput
        newMessage={newMessage}
        sending={sending}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
