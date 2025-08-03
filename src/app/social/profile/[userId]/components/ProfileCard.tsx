"use client";

import { useState, useEffect } from "react";

import { SocialConnectionProcessor } from "@/common/operations/socialConnectionProcessor";
import { useAuth } from "@/hooks/useAuth";
import type { SocialProfile } from "@/types/social";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface ProfileCardProps {
  userId: string;
}

export function ProfileCard({ userId }: ProfileCardProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id, userId]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const result = await SocialConnectionProcessor.getProfile(userId);
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!user?.id || !profile) return;

    try {
      const result = await SocialConnectionProcessor.sendFriendRequest(user.id, profile.id);
      if (result.success) {
        // Handle success
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

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

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        <div className="flex-1">
          <Heading level={2} className="text-xl font-semibold">
            {profile.first_name} {profile.last_name}
          </Heading>
          {profile.bio && (
            <Text className="mt-1 text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </Text>
          )}
        </div>
        {user?.id !== userId && (
          <Button onClick={sendFriendRequest}>
            {isFriend ? "Friends" : "Add Friend"}
          </Button>
        )}
      </div>
    </div>
  );
}
