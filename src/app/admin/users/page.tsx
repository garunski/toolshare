import { Suspense } from "react";

import { Heading } from "@/primitives/heading";

import { AdminUsersList } from "./components/AdminUsersList";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <Heading level={1}>User Management</Heading>

      <Suspense fallback={<div>Loading users...</div>}>
        <AdminUsersList />
      </Suspense>
    </div>
  );
}
