"use client";

import { useState } from "react";

import { Badge } from "@/primitives/badge";

import type {
  Conversation,
  FriendRequest,
  SocialProfile,
} from "@/types/social";

import { DiscoverTab } from "./DiscoverTab";
import { FriendsTab } from "./FriendsTab";
import { MessagesTab } from "./MessagesTab";
import { RequestsTab } from "./RequestsTab";

interface SocialTabsProps {
  friends: SocialProfile[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  conversations: Conversation[];
  suggestedFriends: SocialProfile[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
}

export function SocialTabs({
  friends,
  pendingRequests,
  sentRequests,
  conversations,
  suggestedFriends,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
}: SocialTabsProps) {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <div>
      <div className="mb-4 flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "friends"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "requests"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Requests
          {pendingRequests.length > 0 && (
            <Badge color="red" className="ml-2">
              {pendingRequests.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "messages"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Messages
          {conversations.length > 0 && (
            <Badge color="zinc" className="ml-2">
              {conversations.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "discover"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Discover
        </button>
      </div>

      {activeTab === "friends" && (
        <div className="mt-6">
          <FriendsTab friends={friends} />
        </div>
      )}

      {activeTab === "requests" && (
        <div className="mt-6">
          <RequestsTab
            pendingRequests={pendingRequests}
            sentRequests={sentRequests}
            onAcceptRequest={onAcceptRequest}
            onRejectRequest={onRejectRequest}
            onCancelRequest={onCancelRequest}
          />
        </div>
      )}

      {activeTab === "messages" && (
        <div className="mt-6">
          <MessagesTab conversations={conversations} />
        </div>
      )}

      {activeTab === "discover" && (
        <div className="mt-6">
          <DiscoverTab suggestedFriends={suggestedFriends} />
        </div>
      )}
    </div>
  );
}
