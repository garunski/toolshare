"use client";

import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";

interface MessageInputProps {
  otherUserId: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  sending: boolean;
}

export function MessageInput({
  otherUserId,
  value,
  onChange,
  onSend,
  onKeyPress,
  sending,
}: MessageInputProps) {
  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        placeholder="Type your message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        disabled={sending}
        className="flex-1"
      />
      <Button onClick={onSend} disabled={sending || !value.trim()}>
        {sending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}
