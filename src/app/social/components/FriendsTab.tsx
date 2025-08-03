"use client";

import { useState, useEffect } from "react";

import { SocialConnectionProcessor } from "@/common/operations/socialConnectionProcessor";
import { useAuth } from "@/hooks/useAuth";
import type { SocialProfile } from "@/types/social";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export function FriendsTab() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadFriends();
    }
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;

    try {
      const result = await SocialConnectionProcessor.getFriends(user.id);
      if (result.success) {
        setFriends(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading friends...</Text>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No friends found. Start connecting with people!</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Your Friends
      </Heading>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <div className="flex-1">
                <Text className="font-medium">
                  {friend.first_name} {friend.last_name}
                </Text>
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {friend.bio || "No bio available"}
                </Text>
              </div>
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                outline
                onClick={() => {/* Navigate to friend's profile */}}
                className="w-full"
              >
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
