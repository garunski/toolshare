"use client";

import { useCallback, useEffect, useState } from "react";

import { ProcessConnections } from "@/apiApp/social/connections/processConnections";
import { useAuth } from "@/common/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { SocialProfile } from "@/types/social";

export function DiscoverTab() {
  const { user } = useAuth();
  const [suggestedFriends, setSuggestedFriends] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSuggestedFriends = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await ProcessConnections.getSuggestedFriends(user.id);
      if (result.success) {
        setSuggestedFriends(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load suggested friends:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSuggestedFriends();
    }
  }, [loadSuggestedFriends, user?.id]);

  const sendFriendRequest = async (friendId: string) => {
    if (!user?.id) return;

    try {
      const result = await ProcessConnections.sendFriendRequest(
        user.id,
        friendId,
      );
      if (result.success) {
        // Remove the friend from suggested list
        setSuggestedFriends((prev) =>
          prev.filter((friend) => friend.id !== friendId),
        );
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading suggested friends...</Text>
      </div>
    );
  }

  if (suggestedFriends.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No suggested friends found.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Suggested Friends
      </Heading>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suggestedFriends.map((friend) => (
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
                onClick={() => sendFriendRequest(friend.id)}
                className="w-full"
              >
                Send Friend Request
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
