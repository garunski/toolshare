"use client";

import { useCallback, useEffect, useState } from "react";

import { ProcessConnections } from "@/apiApp/social/connections/processConnections";
import { useAuth } from "@/common/hooks/useAuth";
import type {
  FriendshipStatus,
  ProfileActionHandlers,
} from "@/common/hooks/useProfileActions";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { SocialProfile } from "@/types/social";

import { ProfileActionButtons } from "./shared/ProfileActionButtons";

interface ProfileCardProps {
  userId: string;
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus;
  sendingRequest: boolean;
  onSendFriendRequest: () => Promise<void>;
  onAcceptRequest: () => Promise<void>;
  onRejectRequest: () => Promise<void>;
  onMessage: () => void;
}

export function ProfileCard({
  userId,
  isOwnProfile,
  friendshipStatus,
  sendingRequest,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onMessage,
}: ProfileCardProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const result = await ProcessConnections.getProfile(userId);
      if (result.success && result.data) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading profile...</Text>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Profile not found.</Text>
      </div>
    );
  }

  const handlers: ProfileActionHandlers = {
    onSendFriendRequest,
    onAcceptRequest,
    onRejectRequest,
    onMessage,
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        <div className="flex-1">
          <Heading level={2} className="text-2xl font-bold">
            {profile.first_name} {profile.last_name}
          </Heading>
          <Text className="text-zinc-600 dark:text-zinc-400">
            {profile.bio || "No bio available"}
          </Text>
        </div>
      </div>

      {!isOwnProfile && user && (
        <div className="mt-6">
          <ProfileActionButtons
            isOwnProfile={isOwnProfile}
            friendshipStatus={friendshipStatus}
            sendingRequest={sendingRequest}
            handlers={handlers}
          />
        </div>
      )}
    </div>
  );
}
