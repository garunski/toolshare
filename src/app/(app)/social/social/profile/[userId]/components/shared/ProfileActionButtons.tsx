"use client";

import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";

import {
  useProfileActions,
  type FriendshipStatus,
  type ProfileActionHandlers,
} from "../../hooks/useProfileActions";

interface ProfileActionButtonsProps {
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus;
  sendingRequest: boolean;
  handlers: ProfileActionHandlers;
  className?: string;
}

export function ProfileActionButtons({
  isOwnProfile,
  friendshipStatus,
  sendingRequest,
  handlers,
  className = "",
}: ProfileActionButtonsProps) {
  const {
    showActions,
    actionType,
    buttonText,
    isDisabled,
    showAcceptReject,
    handleAction,
    handleAccept,
    handleReject,
  } = useProfileActions({
    isOwnProfile,
    friendshipStatus,
    sendingRequest,
    handlers,
  });

  if (!showActions) {
    return null;
  }

  return (
    <div className={`flex space-x-3 ${className}`}>
      {actionType === "send_request" && (
        <Button onClick={handleAction} disabled={isDisabled} className="flex-1">
          {buttonText}
        </Button>
      )}

      {actionType === "pending_sent" && (
        <div className="flex-1 text-center text-zinc-600 dark:text-zinc-400">
          <Text>{buttonText}</Text>
        </div>
      )}

      {showAcceptReject && (
        <>
          <Button onClick={handleAccept} className="flex-1">
            Accept Request
          </Button>
          <Button outline onClick={handleReject} className="flex-1">
            Decline Request
          </Button>
        </>
      )}

      {actionType === "friends" && (
        <Button onClick={handleAction} className="flex-1">
          {buttonText}
        </Button>
      )}
    </div>
  );
}
