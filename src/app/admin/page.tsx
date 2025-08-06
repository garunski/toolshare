import { Suspense } from "react";

import { Heading } from "@/primitives/heading";

import { AdminProtection } from "./components/AdminProtection";
import { AdminDashboardStats } from "./components/AdminDashboardStats";
import { AdminRecentActivity } from "./components/AdminRecentActivity";
import { CategoryMetrics } from "./components/CategoryMetrics";
import { AttributeMetrics } from "./components/AttributeMetrics";
import { SystemHealthMonitor } from "./components/SystemHealthMonitor";
import { QuickActionsPanel } from "./components/QuickActionsPanel";

export default function AdminDashboardPage() {
  return (
    <AdminProtection>
      <div className="p-6 space-y-8">
        <div>
          <Heading level={1}>Admin Dashboard</Heading>
          <p className="text-gray-600 mt-1">
            System overview and management tools
          </p>
        </div>

        {/* Stats Overview */}
        <Suspense fallback={<div>Loading stats...</div>}>
          <AdminDashboardStats />
        </Suspense>

        {/* System Health */}
        <SystemHealthMonitor />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
