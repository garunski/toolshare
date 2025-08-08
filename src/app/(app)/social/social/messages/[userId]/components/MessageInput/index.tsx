"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/primitives/button";

interface MessageInputProps {
  receiverId: string;
  currentUserId: string;
}

export function MessageInput({ receiverId, currentUserId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/social/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        setMessage("");
        router.refresh(); // Refresh to show new message
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="border-t border-zinc-200 p-4 dark:border-zinc-700"
    >
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
        />
        <Button type="submit" disabled={!message.trim() || sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}
