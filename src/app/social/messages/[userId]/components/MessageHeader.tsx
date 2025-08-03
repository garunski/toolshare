"use client";

import { useState, useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import type { SocialProfile } from "@/types/social";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface MessageHeaderProps {
  otherUserId: string;
}

export function MessageHeader({ otherUserId }: MessageHeaderProps) {
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState<SocialProfile | null>(null);

  useEffect(() => {
    // Load other user's profile
    const loadOtherUser = async () => {
      try {
        // This would typically fetch from an API
        // For now, we'll use a mock implementation
        setOtherUser({
          id: otherUserId,
          first_name: "User",
          last_name: "Name",
          bio: "User bio",
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadOtherUser();
  }, [otherUserId]);

  if (!otherUser) {
    return (
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        <div>
          <Heading level={3} className="text-lg font-semibold">
            {otherUser.first_name} {otherUser.last_name}
          </Heading>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {otherUser.bio || "No bio available"}
          </Text>
        </div>
      </div>
    </div>
  );
}
