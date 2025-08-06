"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  UserGroupIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";

import { QuickActionItem } from "./QuickActionItem";
import { SystemStatusPanel } from "./SystemStatusPanel";

export function QuickActionsPanel() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshCache = async () => {
    setRefreshing(true);
    // Simulate cache refresh
    setTimeout(() => {
      setRefreshing(false);
      router.refresh();
    }, 1000);
  };

  const quickActions = [
    {
      title: "Create Category",
      description: "Add a new item category",
      icon: TagIcon,
      href: "/admin/categories",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      title: "Create Attribute",
      description: "Define new item attribute",
      icon: AdjustmentsHorizontalIcon,
      href: "/admin/attributes",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
      title: "Manage Users",
      description: "User roles and permissions",
      icon: UserGroupIcon,
      href: "/admin/users",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      title: "View Analytics",
      description: "System usage statistics",
      icon: ChartBarIcon,
      href: "/admin/analytics",
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    },
  ];

  const systemTasks = [
    {
      title: "Database Migration",
      status: "up-to-date" as const,
      description: "All migrations applied",
    },
    {
      title: "Search Index",
      status: "healthy" as const,
      description: "Full-text search operational",
    },
    {
      title: "Storage Usage",
      status: "warning" as const,
      description: "78% of storage used",
    },
  ];



  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow">
        <Heading level={3} className="mb-4">Quick Actions</Heading>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <QuickActionItem key={action.title} action={action} />
          ))}
        </div>
      </div>

      {/* System Status */}
      <SystemStatusPanel
        systemTasks={systemTasks}
        refreshing={refreshing}
        onRefresh={handleRefreshCache}
      />

      {/* Recent Activity Summary */}
      <div className="rounded-lg bg-white p-6 shadow">
        <Heading level={3} className="mb-4">Today&apos;s Summary</Heading>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">New Users</span>
            <Badge color="zinc">12</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Items Added</span>
            <Badge color="zinc">47</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Categories Used</span>
            <Badge color="zinc">8</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Loans</span>
            <Badge color="zinc">23</Badge>
          </div>
        </div>
      </div>
    </div>
  );
} 