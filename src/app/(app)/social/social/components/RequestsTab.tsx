"use client";

import { useCallback, useEffect, useState } from "react";

import { ProcessFriendRequest } from "@/apiApp/social/friends/process/processFriendRequest";
import { useAuth } from "@/common/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { FriendRequest } from "@/types/social";

export function RequestsTab() {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFriendRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await ProcessFriendRequest.getPendingRequests(user.id);
      if (result.success) {
        setFriendRequests(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadFriendRequests();
    }
  }, [loadFriendRequests, user?.id]);

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    if (!user?.id) return;

    try {
      const result = await ProcessFriendRequest.processRequest(
        requestId,
        action,
      );
      if (result.success) {
        // Remove the request from the list
        setFriendRequests((prev) =>
          prev.filter((request) => request.id !== requestId),
        );
      }
    } catch (error) {
      console.error("Failed to process request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading friend requests...</Text>
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No pending friend requests.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Friend Requests
      </Heading>
      <div className="space-y-4">
        {friendRequests.map((request) => (
          <div
            key={request.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <div>
                  <Text className="font-medium">
                    {request.sender?.first_name} {request.sender?.last_name}
                  </Text>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    {request.message || "Wants to be your friend"}
                  </Text>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleRequest(request.id, "accept")}
                  className="px-4"
                >
                  Accept
                </Button>
                <Button
                  outline
                  onClick={() => handleRequest(request.id, "reject")}
                  className="px-4"
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
