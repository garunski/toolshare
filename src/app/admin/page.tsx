import { Suspense } from "react";

import { Heading } from "@/primitives/heading";

import { AdminDashboardStats } from "./components/AdminDashboardStats";
import { AdminProtection } from "./components/AdminProtection";
import { AdminRecentActivity } from "./components/AdminRecentActivity";
import { AttributeMetrics } from "./components/AttributeMetrics";
import { CategoryMetrics } from "./components/CategoryMetrics";
import { QuickActionsPanel } from "./components/QuickActionsPanel";
import { SystemHealthMonitor } from "./components/SystemHealthMonitor";

export default function AdminDashboardPage() {
  return (
    <AdminProtection>
      <div className="space-y-8 p-6">
        <div>
          <Heading level={1}>Admin Dashboard</Heading>
          <p className="mt-1 text-gray-600">
            System overview and management tools
          </p>
        </div>

        {/* Stats Overview */}
        <Suspense fallback={<div>Loading stats...</div>}>
          <AdminDashboardStats />
        </Suspense>

        {/* System Health */}
        <SystemHealthMonitor />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            <CategoryMetrics />
            <AttributeMetrics />
            <Suspense fallback={<div>Loading activity...</div>}>
              <AdminRecentActivity />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <QuickActionsPanel />
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}
