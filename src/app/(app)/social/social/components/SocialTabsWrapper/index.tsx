"use client";

import { useState } from "react";

import { DiscoverFriends } from "../DiscoverFriends";
import { FriendsList } from "../FriendsList";
import { SocialActions } from "../SocialActions";
import { SocialFeed } from "../SocialFeed";
import { SocialTabs } from "../SocialTabs";

interface SocialTabsWrapperProps {
  friends: any[];
  friendRequests: any[];
  suggestedFriends: any[];
  recentActivity: any[];
}

export function SocialTabsWrapper({
  friends,
  friendRequests,
  suggestedFriends,
  recentActivity,
}: SocialTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState("friends");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "friends":
        return <FriendsList friends={friends} />;
      case "discover":
        return <DiscoverFriends suggestedFriends={suggestedFriends} />;
      case "activity":
        return <SocialFeed recentActivity={recentActivity} />;
      case "requests":
        return <SocialActions friendRequests={friendRequests} />;
      default:
        return <FriendsList friends={friends} />;
    }
  };

  return (
    <div className="space-y-6">
      <SocialTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {renderActiveTab()}
      </div>
    </div>
  );
}
