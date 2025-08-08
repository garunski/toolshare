"use client";

import { useCallback, useEffect, useState } from "react";

import { ProcessConnections } from "@/apiApp/social/connections/processConnections";
import { useAuth } from "@/common/supabase/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { SocialConnection } from "@/types/social";

export function FriendsTab() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await ProcessConnections.getFriends(user.id);
      if (result.success) {
        setFriends(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadFriends();
    }
  }, [loadFriends, user?.id]);

  const removeFriend = async (friendId: string) => {
    if (!user?.id) return;

    try {
      const result = await ProcessConnections.removeFriend(user.id, friendId);
      if (result.success) {
        // Remove the friend from the list
        setFriends((prev) =>
          prev.filter((friend) => friend.friend_id !== friendId),
        );
      }
    } catch (error) {
      console.error("Failed to remove friend:", error);
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
        <Text>No friends found.</Text>
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
            key={friend.friend_id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <div className="flex-1">
                <Text className="font-medium">
                  {friend.friend?.first_name} {friend.friend?.last_name}
                </Text>
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {friend.friend?.bio || "No bio available"}
                </Text>
              </div>
            </div>
            <div className="mt-3">
              <Button
                outline
                onClick={() => removeFriend(friend.friend_id)}
                className="w-full"
              >
                Remove Friend
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
