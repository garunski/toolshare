"use client";

import { Button } from "@/primitives/button";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  friendshipStatus: "none" | "friends" | "pending_sent" | "pending_received";
  sendingRequest: boolean;
  onSendFriendRequest: () => Promise<void>;
  onAcceptRequest: () => Promise<void>;
  onRejectRequest: () => Promise<void>;
  onMessage: () => void;
}

export function ProfileActions({
  isOwnProfile,
  friendshipStatus,
  sendingRequest,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onMessage,
}: ProfileActionsProps) {
  if (isOwnProfile) {
    return null;
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex space-x-3">
        {friendshipStatus === "none" && (
          <Button
            onClick={onSendFriendRequest}
            disabled={sendingRequest}
            className="flex-1"
          >
            {sendingRequest ? "Sending..." : "Send Friend Request"}
          </Button>
        )}

        {friendshipStatus === "pending_sent" && (
          <div className="flex-1 text-center text-zinc-600 dark:text-zinc-400">
            Friend request sent
          </div>
        )}

        {friendshipStatus === "pending_received" && (
          <>
            <Button onClick={onAcceptRequest} className="flex-1">
              Accept Request
            </Button>
            <Button outline onClick={onRejectRequest} className="flex-1">
              Decline Request
            </Button>
          </>
        )}

        {friendshipStatus === "friends" && (
          <Button onClick={onMessage} className="flex-1">
            Send Message
          </Button>
        )}
      </div>
    </div>
  );
}
