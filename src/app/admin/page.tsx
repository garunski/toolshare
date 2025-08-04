import { Suspense } from "react";

import { Heading } from "@/primitives/heading";

import { AdminDashboardStats } from "./components/AdminDashboardStats";
import { AdminRecentActivity } from "./components/AdminRecentActivity";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Heading level={1}>Admin Dashboard</Heading>

      <Suspense fallback={<div>Loading stats...</div>}>
        <AdminDashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Suspense fallback={<div>Loading activity...</div>}>
          <AdminRecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
