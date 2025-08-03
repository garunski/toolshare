"use client";

import { Avatar } from "@/primitives/avatar";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import type { SocialProfile } from "../../../../../types/social";

interface MessageHeaderProps {
  otherUser: SocialProfile | null;
  messageCount: number;
  onBack: () => void;
}

export function MessageHeader({
  otherUser,
  messageCount,
  onBack,
}: MessageHeaderProps) {
  return (
    <div className="mb-6">
      <Button outline onClick={onBack} className="mb-4">
        ← Back to Messages
      </Button>

      {otherUser && (
        <div className="flex items-center space-x-3">
          <Avatar
            initials={`${otherUser.first_name[0]}${otherUser.last_name[0]}`}
          />
          <div>
            <Heading
              level={1}
              className="text-2xl font-bold text-zinc-900 dark:text-white"
            >
              {otherUser.first_name} {otherUser.last_name}
            </Heading>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              {messageCount} messages
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}
