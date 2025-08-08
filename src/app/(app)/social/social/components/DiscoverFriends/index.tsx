"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface SuggestedFriend {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface DiscoverFriendsProps {
  suggestedFriends: SuggestedFriend[];
}

export function DiscoverFriends({ suggestedFriends }: DiscoverFriendsProps) {
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(
    new Set(),
  );
  const router = useRouter();

  const sendFriendRequest = async (friendId: string) => {
    setSendingRequests((prev) => new Set(prev).add(friendId));

    try {
      const response = await fetch("/api/social/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: friendId }),
      });

      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setSendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

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
                disabled={sendingRequests.has(friend.id)}
                className="w-full"
              >
                {sendingRequests.has(friend.id)
                  ? "Sending..."
                  : "Send Friend Request"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
