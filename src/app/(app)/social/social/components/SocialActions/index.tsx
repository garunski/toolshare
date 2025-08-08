"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface FriendRequest {
  id: string;
  message: string | null;
  created_at: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface SocialActionsProps {
  friendRequests: FriendRequest[];
}

export function SocialActions({ friendRequests }: SocialActionsProps) {
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set(),
  );
  const router = useRouter();

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    setProcessingRequests((prev) => new Set(prev).add(requestId));

    try {
      const response = await fetch("/api/social/friends/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to process request:", error);
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (friendRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-lg font-semibold">
        Friend Requests ({friendRequests.length})
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
                    {request.profiles.first_name} {request.profiles.last_name}
                  </Text>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    {request.message || "Wants to be your friend"}
                  </Text>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleRequest(request.id, "accept")}
                  disabled={processingRequests.has(request.id)}
                  className="px-4"
                >
                  {processingRequests.has(request.id)
                    ? "Processing..."
                    : "Accept"}
                </Button>
                <Button
                  outline
                  onClick={() => handleRequest(request.id, "reject")}
                  disabled={processingRequests.has(request.id)}
                  className="px-4"
                >
                  {processingRequests.has(request.id)
                    ? "Processing..."
                    : "Decline"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
