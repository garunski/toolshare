"use client";

import { Button } from "@/primitives/button";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: "tools", label: "Tools" },
    { id: "activity", label: "Activity" },
    { id: "reviews", label: "Reviews" },
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
