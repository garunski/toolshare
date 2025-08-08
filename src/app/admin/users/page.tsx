import { Suspense } from "react";

import { Heading } from "@/primitives/heading";

import { AdminUsersList } from "./components/AdminUsersList";
import { getUsers } from "./getUsers";

export default async function AdminUsersPage() {
  const { users, roles, roleStats } = await getUsers();

  return (
    <div className="space-y-8">
      <Heading level={1}>User Management</Heading>

      <Suspense fallback={<div>Loading users...</div>}>
        <AdminUsersList users={users} roles={roles} roleStats={roleStats} />
      </Suspense>
    </div>
  );
}
