"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/primitives/button";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  friendshipStatus: "friends" | "pending_sent" | "pending_received" | "none";
  sendingRequest: boolean;
  onSendFriendRequest: () => void;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
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
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <div className="mb-6">
      <Button outline onClick={handleBack} className="mb-4">
        ← Back
      </Button>

      {!isOwnProfile && (
        <div className="space-y-3">
          {friendshipStatus === "none" && (
            <Button
              onClick={onSendFriendRequest}
              disabled={sendingRequest}
              className="w-full"
            >
              {sendingRequest ? "Sending..." : "Add Friend"}
            </Button>
          )}

          {friendshipStatus === "pending_sent" && (
            <Button outline disabled className="w-full">
              Friend Request Sent
            </Button>
          )}

          {friendshipStatus === "pending_received" && (
            <div className="space-y-2">
              <Button onClick={onAcceptRequest} className="w-full">
                Accept Request
              </Button>
              <Button outline onClick={onRejectRequest} className="w-full">
                Reject Request
              </Button>
            </div>
          )}

          {friendshipStatus === "friends" && (
            <Button onClick={onMessage} className="w-full">
              Send Message
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
