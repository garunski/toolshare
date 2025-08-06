"use client";

import { useEffect, useState } from "react";

import { Text } from "@/primitives/text";
import type { Role, UserWithRoles } from "@/types/roles";

import { RoleManagement } from "./RoleManagement";

interface UserRoleAssignmentProps {
  user: UserWithRoles;
  availableRoles: Role[];
  onRoleUpdated: () => void;
}

export function UserRoleAssignment({
  user,
  availableRoles,
  onRoleUpdated,
}: UserRoleAssignmentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAssignRole = async (roleId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign role");
      }

      setSuccess("Role assigned successfully");
      onRoleUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/users/${user.id}/roles?roleId=${roleId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove role");
      }

      setSuccess("Role removed successfully");
      onRoleUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove role");
    } finally {
      setLoading(false);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const userRoleIds = user.roles.map((role) => role.id);
  const availableRolesForUser = availableRoles.filter(
    (role) => !userRoleIds.includes(role.id),
  );

  return (
    <div className="space-y-4">
      <RoleManagement
        roles={availableRoles}
        userRoleIds={userRoleIds}
        onAssignRole={handleAssignRole}
        onRemoveRole={handleRemoveRole}
        loading={loading}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <Text className="text-sm text-red-800">{error}</Text>
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3">
          <Text className="text-sm text-green-800">{success}</Text>
        </div>
      )}
    </div>
  );
}
