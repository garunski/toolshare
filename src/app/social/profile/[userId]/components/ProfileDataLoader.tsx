"use client";

import { useCallback, useEffect } from "react";

import { SocialConnectionProcessor } from "@/common/operations/socialConnectionProcessor";
import { useAuth } from "@/hooks/useAuth";
import type { SocialProfile, SocialStats } from "@/types/social";

interface ProfileDataLoaderProps {
  userId: string;
  onDataLoaded: (
    profile: SocialProfile,
    stats: SocialStats,
    friendshipStatus: string,
  ) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
}

export function ProfileDataLoader({
  userId,
  onDataLoaded,
  onLoadingChange,
  onError,
}: ProfileDataLoaderProps) {
  const { user: currentUser } = useAuth();

  const loadUserProfile = useCallback(async () => {
    try {
      onLoadingChange(true);

      const mockProfile: SocialProfile = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        bio: "Tool enthusiast and community builder. Always happy to help others with their projects!",
        phone: "+1 (555) 123-4567",
        address: "San Francisco, CA",
        created_at: new Date("2024-01-15").toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockStats: SocialStats = {
        total_friends: 24,
        total_loans: 15,
        average_rating: 4.8,
        trust_score: 85,
      };

      let friendshipStatus = "none";
      if (currentUser && currentUser.id !== userId) {
        friendshipStatus =
          await SocialConnectionProcessor.checkFriendshipStatus(
            currentUser.id,
            userId,
          );
      }

      onDataLoaded(mockProfile, mockStats, friendshipStatus);
    } catch (error) {
      onError("Failed to load user profile");
    } finally {
      onLoadingChange(false);
    }
  }, [userId, currentUser, onDataLoaded, onLoadingChange, onError]);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId, loadUserProfile]);

  return null;
}
