"use client";

import { useState } from "react";

import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface MessageContainerProps {
  otherUserId: string;
}

export function MessageContainer({ otherUserId }: MessageContainerProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Handle sending message
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <MessageList otherUserId={otherUserId} />
      </div>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
        <MessageInput
          otherUserId={otherUserId}
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          sending={sending}
        />
      </div>
    </div>
  );
}
