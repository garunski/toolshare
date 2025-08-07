"use client";

import { useCallback, useEffect, useState } from "react";

import { SocialConnectionProcessor } from "@/common/operations/socialConnectionProcessor";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { SocialProfile } from "@/types/social";

interface MessageHeaderProps {
  otherUserId: string;
  onBack: () => void;
}

export function MessageHeader({ otherUserId, onBack }: MessageHeaderProps) {
  const [otherUser, setOtherUser] = useState<SocialProfile | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      const result = await SocialConnectionProcessor.getProfile(otherUserId);
      if (result.success && result.data) {
        setOtherUser(result.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Set fallback data
      setOtherUser({
        id: otherUserId,
        first_name: "User",
        last_name: "Unknown",
        bio: "User bio",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [otherUserId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
      <div className="flex items-center space-x-3">
        <Button plain onClick={onBack}>
          ← Back
        </Button>
        <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        <div>
          <Heading level={4} className="text-lg font-semibold">
            {otherUser?.first_name} {otherUser?.last_name}
          </Heading>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {messageCount} messages
          </Text>
        </div>
      </div>
    </div>
  );
}
