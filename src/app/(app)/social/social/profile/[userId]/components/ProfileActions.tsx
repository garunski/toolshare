"use client";

import type {
  FriendshipStatus,
  ProfileActionHandlers,
} from "../hooks/useProfileActions";

import { ProfileActionButtons } from "./shared/ProfileActionButtons";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus;
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
  const handlers: ProfileActionHandlers = {
    onSendFriendRequest,
    onAcceptRequest,
    onRejectRequest,
    onMessage,
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <ProfileActionButtons
        isOwnProfile={isOwnProfile}
        friendshipStatus={friendshipStatus}
        sendingRequest={sendingRequest}
        handlers={handlers}
      />
    </div>
  );
}
