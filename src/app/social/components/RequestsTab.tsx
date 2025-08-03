"use client";

import { useState, useEffect } from "react";

import { FriendRequestProcessor } from "@/common/operations/friendRequestProcessor";
import { useAuth } from "@/hooks/useAuth";
import type { SocialProfile } from "@/types/social";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export function RequestsTab() {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<Array<{ id: string; sender: SocialProfile; message?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadFriendRequests();
    }
  }, [user?.id]);

  const loadFriendRequests = async () => {
    if (!user?.id) return;

    try {
      const result = await FriendRequestProcessor.getPendingRequests(user.id);
      if (result.success) {
        setFriendRequests(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (!user?.id) return;

    try {
      const result = await FriendRequestProcessor.processRequest(requestId, action);
      if (result.success) {
        // Remove the request from the list
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
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
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <div className="flex-1">
                <Text className="font-medium">
                  {request.sender.first_name} {request.sender.last_name}
                </Text>
                {request.message && (
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    {request.message}
                  </Text>
                )}
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleRequest(request.id, 'accept')}
                className="flex-1"
              >
                Accept
              </Button>
              <Button
                size="sm"
                outline
                onClick={() => handleRequest(request.id, 'decline')}
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
