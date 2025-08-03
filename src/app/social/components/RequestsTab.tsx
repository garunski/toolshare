"use client";

import { Avatar } from "@/primitives/avatar";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import type { FriendRequest } from "../../../types/social";

interface RequestsTabProps {
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
}

export function RequestsTab({
  pendingRequests,
  sentRequests,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
}: RequestsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Pending Requests ({pendingRequests.length})
          </Heading>
        </div>
        <div>
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
              <Text>No pending friend requests</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      initials={`${request.sender?.first_name[0]}${request.sender?.last_name[0]}`}
                    />
                    <div>
                      <Text className="font-medium text-zinc-900 dark:text-white">
                        {request.sender?.first_name} {request.sender?.last_name}
                      </Text>
                      {request.message && (
                        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                          &ldquo;{request.message}&rdquo;
                        </Text>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => onAcceptRequest(request.id)}>
                      Accept
                    </Button>
                    <Button outline onClick={() => onRejectRequest(request.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Sent Requests ({sentRequests.length})
          </Heading>
        </div>
        <div>
          {sentRequests.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
              <Text>No sent friend requests</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      initials={`${request.receiver?.first_name[0]}${request.receiver?.last_name[0]}`}
                    />
                    <div>
                      <Text className="font-medium text-zinc-900 dark:text-white">
                        {request.receiver?.first_name}{" "}
                        {request.receiver?.last_name}
                      </Text>
                      <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                        Status: {request.status}
                      </Text>
                    </div>
                  </div>
                  {request.status === "pending" && (
                    <Button outline onClick={() => onCancelRequest(request.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
