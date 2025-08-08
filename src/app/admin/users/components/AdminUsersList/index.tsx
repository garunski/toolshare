import { Text } from "@/primitives/text";
import type { Role, UserWithRoles } from "@/types/roles";

import { UserCardWrapper } from "../UserCardWrapper";
import { UserManagementActions } from "../UserManagementActions";

interface AdminUsersListProps {
  users: UserWithRoles[];
  roles: Role[];
  roleStats: any[];
}

export function AdminUsersList({
  users,
  roles,
  roleStats,
}: AdminUsersListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Text className="text-gray-600">No users found</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementActions roles={roles} />

      <div className="space-y-4">
        {users.map((user) => (
          <UserCardWrapper key={user.id} user={user} availableRoles={roles} />
        ))}
      </div>
    </div>
  );
}
