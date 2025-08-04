"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/common/supabase/client";
import { Text } from "@/primitives/text";

interface DashboardStats {
  totalUsers: number;
  totalTools: number;
  totalLoans: number;
  activeLoans: number;
}

export function AdminDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTools: 0,
    totalLoans: 0,
    activeLoans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient();
        const [usersResult, toolsResult, loansResult, activeLoansResult] =
          await Promise.all([
            supabase.from("profiles").select("id", { count: "exact" }),
            supabase.from("tools").select("id", { count: "exact" }),
            supabase.from("loans").select("id", { count: "exact" }),
            supabase
              .from("loans")
              .select("id", { count: "exact" })
              .eq("status", "active"),
          ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalTools: toolsResult.count || 0,
          totalLoans: loansResult.count || 0,
          activeLoans: activeLoansResult.count || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="animate-pulse">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-8 w-1/2 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-white p-6 shadow">
        <Text className="text-sm font-medium text-gray-600">Total Users</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {stats.totalUsers}
        </Text>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <Text className="text-sm font-medium text-gray-600">Total Tools</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {stats.totalTools}
        </Text>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <Text className="text-sm font-medium text-gray-600">Total Loans</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {stats.totalLoans}
        </Text>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <Text className="text-sm font-medium text-gray-600">Active Loans</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {stats.activeLoans}
        </Text>
      </div>
    </div>
  );
}
