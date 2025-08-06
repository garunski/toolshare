"use client";

import { useState } from "react";

import { RoleFormatter } from "@/common/formatters/roleFormatter";
import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";
import type { Role, UserWithRoles } from "@/types/roles";

import { UserRoleAssignment } from "./UserRoleAssignment";

interface UserCardProps {
  user: UserWithRoles;
  availableRoles: Role[];
  onRoleUpdated: () => void;
}

export function UserCard({
  user,
  availableRoles,
  onRoleUpdated,
}: UserCardProps) {
  const [showRoleManagement, setShowRoleManagement] = useState(false);

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Text className="font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </Text>
          {user.email && (
            <Text className="text-sm text-gray-500">{user.email}</Text>
          )}
          {user.phone && (
            <Text className="text-sm text-gray-500">{user.phone}</Text>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            outline
            onClick={() => setShowRoleManagement(!showRoleManagement)}
            className="px-3 py-1 text-sm"
          >
            {showRoleManagement ? "Hide Role Management" : "Manage Roles"}
          </Button>
        </div>
      </div>

      {!showRoleManagement && (
        <div className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Current Roles
          </Text>
          <div className="flex flex-wrap gap-2">
            {user.roles.length === 0 ? (
              <Text className="text-sm text-gray-500">No roles assigned</Text>
            ) : (
              user.roles.map((role) => (
                <Badge
                  key={role.id}
                  className={RoleFormatter.getRoleBadgeColor(role.name)}
                >
                  {RoleFormatter.formatRoleName(role)}
                </Badge>
              ))
            )}
          </div>
        </div>
      )}

      {showRoleManagement && (
        <div className="border-t pt-4">
          <UserRoleAssignment
            user={user}
            availableRoles={availableRoles}
            onRoleUpdated={onRoleUpdated}
          />
        </div>
      )}
    </div>
  );
}
