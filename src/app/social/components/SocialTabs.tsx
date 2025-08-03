"use client";

import { useState } from "react";

import { Button } from "@/primitives/button";
import { DiscoverTab } from "./DiscoverTab";
import { FriendsTab } from "./FriendsTab";
import { MessagesTab } from "./MessagesTab";
import { RequestsTab } from "./RequestsTab";

type TabType = "discover" | "friends" | "messages" | "requests";

export function SocialTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("discover");

  const tabs = [
    { id: "discover" as const, label: "Discover", component: DiscoverTab },
    { id: "friends" as const, label: "Friends", component: FriendsTab },
    { id: "messages" as const, label: "Messages", component: MessagesTab },
    { id: "requests" as const, label: "Requests", component: RequestsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            plain
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
