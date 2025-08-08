"use client";

import { useRealtimeAdminData } from "@/admin/hooks";
import { Text } from "@/primitives/text";

export function AdminDashboardStats() {
  const { stats, loading, lastUpdate } = useRealtimeAdminData();

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Text className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <Text className="text-xs text-green-600">Live</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <Text className="text-sm font-medium text-gray-600">Total Users</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {stats.totalUsers}
          </Text>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <Text className="text-sm font-medium text-gray-600">Total Items</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {stats.totalItems}
          </Text>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <Text className="text-sm font-medium text-gray-600">Categories</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {stats.totalCategories}
          </Text>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <Text className="text-sm font-medium text-gray-600">
            Active Loans
          </Text>
          <Text className="text-3xl font-bold text-gray-900">
            {stats.activeLoans}
          </Text>
        </div>
      </div>
    </div>
  );
}
