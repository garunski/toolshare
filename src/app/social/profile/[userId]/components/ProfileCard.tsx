"use client";

import { Avatar } from "@/primitives/avatar";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import type { SocialProfile } from "@/types/social";

interface ProfileCardProps {
  profile: SocialProfile;
  isOwnProfile: boolean;
  friendshipStatus: "friends" | "pending_sent" | "pending_received" | "none";
  sendingRequest: boolean;
  onSendFriendRequest: () => void;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  onMessage: () => void;
}

export function ProfileCard({
  profile,
  isOwnProfile,
  friendshipStatus,
  sendingRequest,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onMessage,
}: ProfileCardProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-6 text-center">
        <Avatar
          initials={`${profile.first_name[0]}${profile.last_name[0]}`}
          className="mx-auto mb-4 h-24 w-24"
        />
        <Heading
          level={1}
          className="text-2xl font-bold text-zinc-900 dark:text-white"
        >
          {profile.first_name} {profile.last_name}
        </Heading>
        {profile.bio && (
          <Text className="mt-2 text-zinc-500 dark:text-zinc-400">
            {profile.bio}
          </Text>
        )}
      </div>

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

      <div className="mt-6 space-y-3">
        {profile.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Text className="text-zinc-500 dark:text-zinc-400">Phone:</Text>
            <Text className="text-zinc-900 dark:text-white">
              {profile.phone}
            </Text>
          </div>
        )}
        {profile.address && (
          <div className="flex items-center space-x-2 text-sm">
            <Text className="text-zinc-500 dark:text-zinc-400">Location:</Text>
            <Text className="text-zinc-900 dark:text-white">
              {profile.address}
            </Text>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm">
          <Text className="text-zinc-500 dark:text-zinc-400">
            Member since:
          </Text>
          <Text className="text-zinc-900 dark:text-white">
            {new Date(profile.created_at).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </div>
  );
}
