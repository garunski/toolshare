"use client";

import { MessageHeader } from "./MessageHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface MessageContainerProps {
  userId: string;
  otherUserId: string;
}

export function MessageContainer({ userId, otherUserId }: MessageContainerProps) {
  return (
    <div className="flex h-full flex-col">
      <MessageHeader otherUserId={otherUserId} />
      <MessageList userId={userId} otherUserId={otherUserId} />
      <MessageInput userId={userId} otherUserId={otherUserId} />
    </div>
  );
}
