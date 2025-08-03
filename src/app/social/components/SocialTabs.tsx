"use client";

import { Button } from "@/primitives/button";

interface SocialTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SocialTabs({ activeTab, onTabChange }: SocialTabsProps) {
  const tabs = [
    { id: "friends", label: "Friends" },
    { id: "discover", label: "Discover" },
    { id: "messages", label: "Messages" },
    { id: "requests", label: "Requests" },
  ];

  return (
    <div className="flex space-x-1 border-b border-zinc-200 dark:border-zinc-700">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          plain
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 rounded-none border-b-2 px-4 py-2 ${
            activeTab === tab.id
              ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
