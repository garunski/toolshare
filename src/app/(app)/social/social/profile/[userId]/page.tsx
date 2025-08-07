"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ProcessConnections } from "@/apiApp/social/connections/processConnections";
import { useAuth } from "@/common/hooks/useAuth";
import type { SocialProfile, SocialStats } from "@/types/social";

import { ProfileActions } from "./components/ProfileActions";
import { ProfileActivityTab } from "./components/ProfileActivityTab";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileReviewsTab } from "./components/ProfileReviewsTab";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileTabs } from "./components/ProfileTabs";
import { ProfileToolsTab } from "./components/ProfileToolsTab";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "none" | "friends" | "pending_sent" | "pending_received"
  >("none");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");

  const isOwnProfile = user?.id === userId;

  const loadProfileData = useCallback(async () => {
    if (!userId) return;

    try {
      const [profileResult, statsResult] = await Promise.all([
        ProcessConnections.getProfile(userId),
        ProcessConnections.getSocialStats(userId),
      ]);

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data);
      }

      if (statsResult.success && statsResult.data) {
        setSocialStats(statsResult.data);
      }

      if (user?.id && !isOwnProfile) {
        const statusResult = await ProcessConnections.checkFriendshipStatus(
          user.id,
          userId,
        );
        if (statusResult.success) {
          setFriendshipStatus(statusResult.data);
        }
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  }, [userId, user?.id, isOwnProfile]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleSendFriendRequest = async () => {
    if (!user?.id || !profile) return;

    setSendingRequest(true);
    try {
      const result = await ProcessConnections.sendFriendRequest(
        user.id,
        profile.id,
      );
      if (result.success) {
        setFriendshipStatus("pending_sent");
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async () => {
    console.log("Accept request");
  };

  const handleRejectRequest = async () => {
    console.log("Reject request");
  };

  const handleMessage = () => {
    router.push(`/social/messages/${userId}`);
  };

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-center p-8">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <ProfileCard
          userId={userId}
          isOwnProfile={isOwnProfile}
          friendshipStatus={friendshipStatus}
          sendingRequest={sendingRequest}
          onSendFriendRequest={handleSendFriendRequest}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onMessage={handleMessage}
        />

        {socialStats && <ProfileStats socialStats={socialStats} />}

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          {activeTab === "tools" && <ProfileToolsTab userId={userId} />}
          {activeTab === "activity" && <ProfileActivityTab userId={userId} />}
          {activeTab === "reviews" && <ProfileReviewsTab userId={userId} />}
        </div>

        {!isOwnProfile && (
          <ProfileActions
            isOwnProfile={isOwnProfile}
            friendshipStatus={friendshipStatus}
            sendingRequest={sendingRequest}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onMessage={handleMessage}
          />
        )}
      </div>
    </div>
  );
}
