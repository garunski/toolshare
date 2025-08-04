import { Suspense } from "react";

import { Heading } from "@/primitives/heading";

import { AdminRolesList } from "./components/AdminRolesList";

export default function AdminRolesPage() {
  return (
    <div className="space-y-8">
      <Heading level={1}>Role Management</Heading>

      <Suspense fallback={<div>Loading roles...</div>}>
        <AdminRolesList />
      </Suspense>
    </div>
  );
}
