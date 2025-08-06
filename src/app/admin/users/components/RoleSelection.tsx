"use client";

import { RoleFormatter } from "@/common/formatters/roleFormatter";
import { Badge } from "@/primitives/badge";
import { Text } from "@/primitives/text";
import type { Role } from "@/types/roles";

interface RoleSelectionProps {
  roles: Role[];
  selectedRoleIds: string[];
  onRoleToggle: (roleId: string) => void;
}

export function RoleSelection({
  roles,
  selectedRoleIds,
  onRoleToggle,
}: RoleSelectionProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Assign Roles
      </label>
      <div className="space-y-2">
        {roles.map((role) => (
          <label key={role.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedRoleIds.includes(role.id)}
              onChange={() => onRoleToggle(role.id)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Badge className={RoleFormatter.getRoleBadgeColor(role.name)}>
              {RoleFormatter.formatRoleName(role)}
            </Badge>
            <Text className="text-sm text-gray-600">{role.description}</Text>
          </label>
        ))}
      </div>
    </div>
  );
}
