"use client";

import { RoleFormatter } from "@/common/formatters/roleFormatter";
import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";
import type { Role } from "@/types/roles";

interface RoleManagementProps {
  roles: Role[];
  userRoleIds: string[];
  onAssignRole: (roleId: string) => void;
  onRemoveRole: (roleId: string) => void;
  loading: boolean;
}

export function RoleManagement({
  roles,
  userRoleIds,
  onAssignRole,
  onRemoveRole,
  loading,
}: RoleManagementProps) {
  const availableRolesForUser = roles.filter(
    (role) => !userRoleIds.includes(role.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <Text className="mb-3 text-sm font-medium text-gray-700">
          Current Roles
        </Text>
        {userRoleIds.length === 0 ? (
          <Text className="text-sm text-gray-500">No roles assigned</Text>
        ) : (
          <div className="space-y-2">
            {roles
              .filter((role) => userRoleIds.includes(role.id))
              .map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <Badge className={RoleFormatter.getRoleBadgeColor(role.name)}>
                    {RoleFormatter.formatRoleName(role)}
                  </Badge>
                  <Button
                    outline
                    onClick={() => onRemoveRole(role.id)}
                    disabled={loading}
                    className="h-7 px-3 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>

      {availableRolesForUser.length > 0 && (
        <div>
          <Text className="mb-3 text-sm font-medium text-gray-700">
            Available Roles
          </Text>
          <div className="space-y-2">
            {availableRolesForUser.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <Badge className={RoleFormatter.getRoleBadgeColor(role.name)}>
                  {RoleFormatter.formatRoleName(role)}
                </Badge>
                <Button
                  onClick={() => onAssignRole(role.id)}
                  disabled={loading}
                  className="h-7 px-3 text-xs"
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
