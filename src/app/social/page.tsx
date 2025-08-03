"use client";

import { useCallback, useEffect, useState } from "react";

import { FriendRequestProcessor } from "../../common/operations/friendRequestProcessor";
import { MessageThreadManager } from "../../common/operations/messageThreadManager";
import { SocialConnectionManager } from "../../common/operations/socialConnectionManager";
import { useAuth } from "../../hooks/useAuth";
import type {
  Conversation,
  FriendRequest,
  SocialProfile,
  SocialStats,
} from "../../types/social";

import { SocialHeader } from "./components/SocialHeader";
import { SocialTabs } from "./components/SocialTabs";

export default function SocialPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<SocialProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<SocialProfile[]>([]);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSocialData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [
        friendsData,
        pendingRequestsData,
        sentRequestsData,
        conversationsData,
        suggestedFriendsData,
        socialStatsData,
      ] = await Promise.all([
        SocialConnectionManager.getFriends(user.id),
        FriendRequestProcessor.getPendingRequests(user.id),
        FriendRequestProcessor.getSentRequests(user.id),
        MessageThreadManager.getConversations(user.id),
        SocialConnectionManager.getSuggestedFriends(user.id),
        SocialConnectionManager.getSocialStats(user.id),
      ]);

      setFriends(friendsData.map((conn) => conn.friend!));
      setPendingRequests(pendingRequestsData);
      setSentRequests(sentRequestsData);
      setConversations(conversationsData);
      setSuggestedFriends(suggestedFriendsData);
      setSocialStats(socialStatsData);
    } catch (error) {
      console.error("Failed to load social data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user, loadSocialData]);

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;

    try {
      await FriendRequestProcessor.respondToFriendRequest(
        requestId,
        "accept",
        user.id,
      );
      await loadSocialData();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return;

    try {
      await FriendRequestProcessor.respondToFriendRequest(
        requestId,
        "reject",
        user.id,
      );
      await loadSocialData();
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!user) return;

    try {
      await FriendRequestProcessor.cancelFriendRequest(requestId, user.id);
      await loadSocialData();
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">Loading social network...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <SocialHeader socialStats={socialStats} />

      <SocialTabs
        friends={friends}
        pendingRequests={pendingRequests}
        sentRequests={sentRequests}
        conversations={conversations}
        suggestedFriends={suggestedFriends}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onCancelRequest={handleCancelRequest}
      />
    </div>
  );
}
