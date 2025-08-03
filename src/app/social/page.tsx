"use client";

import { useState } from "react";

import { DiscoverTab } from "./components/DiscoverTab";
import { FriendsTab } from "./components/FriendsTab";
import { MessagesTab } from "./components/MessagesTab";
import { RequestsTab } from "./components/RequestsTab";
import { SocialHeader } from "./components/SocialHeader";
import { SocialTabs } from "./components/SocialTabs";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [socialStats, setSocialStats] = useState(null);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "friends":
        return <FriendsTab />;
      case "discover":
        return <DiscoverTab />;
      case "messages":
        return <MessagesTab />;
      case "requests":
        return <RequestsTab />;
      default:
        return <FriendsTab />;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Social
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Connect with friends and discover new people
        </p>
      </div>

      <div className="space-y-6">
        <SocialHeader socialStats={socialStats} />
        <SocialTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
