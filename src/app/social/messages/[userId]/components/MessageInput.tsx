"use client";

import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";

interface MessageInputProps {
  newMessage: string;
  sending: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function MessageInput({
  newMessage,
  sending,
  onMessageChange,
  onSendMessage,
  onKeyPress,
}: MessageInputProps) {
  return (
    <div className="border-t p-4">
      <div className="flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onMessageChange(e.target.value)
          }
          onKeyPress={onKeyPress}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1"
        />
        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
