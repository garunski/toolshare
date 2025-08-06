"use client";

import { ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { RealtimeConnectionManager } from "@/common/operations/realtimeConnectionManager";
import { Heading } from "@/primitives/heading";

import { LiveActivityHelpers } from "./helpers/LiveActivityHelpers";

interface ActivityItem {
  id: string;
  type: "user_joined" | "item_added" | "loan_requested" | "message_sent";
  user_name: string;
  user_avatar?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const loadActivities = async () => {
      setActivities([]);
    };

    loadActivities();

    const unsubscribe = RealtimeConnectionManager.subscribe("live-activity", {
      table: "activity_log",
      event: "INSERT",
      callback: (payload) => {
        const newActivity: ActivityItem = {
          id: payload.new.id,
          type: payload.new.type,
          user_name: payload.new.user_name,
          user_avatar: payload.new.user_avatar,
          description: payload.new.description,
          timestamp: payload.new.created_at,
          metadata: payload.new.metadata,
        };

        setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
        setIsLive(true);
        setTimeout(() => setIsLive(false), 3000);
      },
    });

    return unsubscribe;
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={3}>Live Activity</Heading>
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-green-500" : "bg-gray-300"}`}
          />
          <span className="text-xs text-gray-500">
            {isLive ? "Live" : "Connected"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <ClockIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>No recent activity</p>
            <p className="mt-1 text-sm">
              Activity will appear here in real-time
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <LiveActivityHelpers.ActivityItem
              key={activity.id}
              activity={activity}
            />
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 border-t pt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}
