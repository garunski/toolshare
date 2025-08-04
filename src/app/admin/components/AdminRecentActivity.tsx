"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/common/supabase/client";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface RecentActivity {
  id: string;
  type: "user_registration" | "tool_added" | "loan_created";
  description: string;
  timestamp: string;
  user_name?: string;
}

export function AdminRecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const supabase = createClient();
        // Fetch recent user registrations
        const { data: recentUsers } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch recent tools
        const { data: recentTools } = await supabase
          .from("tools")
          .select(
            "id, name, created_at, owner:profiles!tools_owner_id_fkey(first_name, last_name)",
          )
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch recent loans
        const { data: recentLoans } = await supabase
          .from("loans")
          .select(
            "id, status, created_at, borrower:profiles!loans_borrower_id_fkey(first_name, last_name)",
          )
          .order("created_at", { ascending: false })
          .limit(5);

        // Combine and format activities
        const formattedActivities: RecentActivity[] = [
          ...(recentUsers?.map((user) => ({
            id: user.id,
            type: "user_registration" as const,
            description: `New user registered`,
            timestamp: user.created_at || "",
            user_name: `${user.first_name} ${user.last_name}`,
          })) || []),
          ...(recentTools?.map((tool) => ({
            id: tool.id,
            type: "tool_added" as const,
            description: `Tool "${tool.name}" added`,
            timestamp: tool.created_at || "",
            user_name:
              tool.owner && Array.isArray(tool.owner) && tool.owner[0]
                ? `${tool.owner[0].first_name} ${tool.owner[0].last_name}`
                : "Unknown",
          })) || []),
          ...(recentLoans?.map((loan) => ({
            id: loan.id,
            type: "loan_created" as const,
            description: `Loan ${loan.status}`,
            timestamp: loan.created_at || "",
            user_name:
              loan.borrower && Array.isArray(loan.borrower) && loan.borrower[0]
                ? `${loan.borrower[0].first_name} ${loan.borrower[0].last_name}`
                : "Unknown",
          })) || []),
        ];

        // Sort by timestamp and take top 10
        const sortedActivities = formattedActivities
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 10);

        setActivities(sortedActivities);
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivity();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <Heading level={3}>Recent Activity</Heading>
        <div className="mt-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <Heading level={3}>Recent Activity</Heading>
      <div className="mt-4 space-y-4">
        {activities.length === 0 ? (
          <Text className="text-gray-500">No recent activity</Text>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="border-l-4 border-indigo-500 pl-4"
            >
              <Text className="text-sm font-medium text-gray-900">
                {activity.description}
              </Text>
              <Text className="text-xs text-gray-500">
                by {activity.user_name} •{" "}
                {new Date(activity.timestamp).toLocaleDateString()}
              </Text>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
