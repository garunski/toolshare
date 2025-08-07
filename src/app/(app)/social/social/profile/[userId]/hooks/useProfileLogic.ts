import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ProcessFriendRequest } from "@/apiApp/social/friends/process/processFriendRequest";
import { useAuth } from "@/common/hooks/useAuth";
import type { SocialProfile, SocialStats } from "@/types/social";

export function useProfileLogic() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "friends" | "pending_sent" | "pending_received" | "none"
  >("none");
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  const userId = params.userId as string;

  const handleDataLoaded = (
    profile: SocialProfile,
    stats: SocialStats,
    friendshipStatus: string,
  ) => {
    setProfile(profile);
    setSocialStats(stats);
    setFriendshipStatus(friendshipStatus as any);
  };

  const handleSendFriendRequest = async () => {
    if (!currentUser || !profile || sendingRequest) return;

    try {
      setSendingRequest(true);
      await ProcessFriendRequest.sendFriendRequest(
        {
          receiver_id: profile.id,
          message: `Hi ${profile.first_name}! I&apos;d like to connect with you on ToolShare.`,
        },
        currentUser.id,
      );

      setFriendshipStatus("pending_sent");
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!currentUser || !profile) return;

    try {
      setFriendshipStatus("friends");
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleRejectRequest = async () => {
    if (!currentUser || !profile) return;

    try {
      setFriendshipStatus("none");
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleMessage = () => {
    if (profile) {
      router.push(`/social/messages/${profile.id}`);
    }
  };

  const isOwnProfile = currentUser?.id === profile?.id;

  return {
    profile,
    socialStats,
    friendshipStatus,
    loading,
    sendingRequest,
    userId,
    isOwnProfile,
    handleDataLoaded,
    handleSendFriendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleMessage,
    setLoading,
  };
}
