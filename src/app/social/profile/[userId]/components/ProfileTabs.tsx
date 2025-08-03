"use client";

import { useState } from "react";

import { ProfileActivityTab } from "./ProfileActivityTab";
import { ProfileReviewsTab } from "./ProfileReviewsTab";
import { ProfileToolsTab } from "./ProfileToolsTab";

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <div className="w-full">
      <div className="mb-4 flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "activity"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "tools"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "reviews"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Reviews
        </button>
      </div>

      {activeTab === "activity" && <ProfileActivityTab />}

      {activeTab === "tools" && <ProfileToolsTab />}

      {activeTab === "reviews" && <ProfileReviewsTab />}
    </div>
  );
}
