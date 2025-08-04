"use client";

import { useEffect, useState } from "react";

import { RoleFormatter } from "@/common/formatters/roleFormatter";
import { Badge } from "@/primitives/badge";
import { Text } from "@/primitives/text";
import type { RoleWithPermissions } from "@/types/roles";

export function AdminRolesList() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch("/api/admin/roles");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch roles");
        }

        setRoles(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch roles");
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white p-4 shadow">
            <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
            <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-3 w-1/3 rounded bg-gray-200"></div>
              <div className="h-3 w-1/4 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <Text className="text-red-800">Error: {error}</Text>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Text className="text-gray-600">No roles found</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.id} className="rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <Text className="font-medium text-gray-900">
                {RoleFormatter.formatRoleName(role)}
              </Text>
              {role.description && (
                <Text className="text-sm text-gray-500">
                  {role.description}
                </Text>
              )}
            </div>
            <div className="flex items-center gap-2">
              {role.is_system_role && (
                <Badge className="bg-blue-100 text-blue-800">System Role</Badge>
              )}
            </div>
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Permissions:
            </Text>
            <div className="flex flex-wrap gap-2">
              {role.permissions.length === 0 ? (
                <Text className="text-sm text-gray-500">No permissions</Text>
              ) : (
                role.permissions.map((permission) => (
                  <Badge
                    key={permission.id}
                    className="bg-gray-100 text-gray-800"
                  >
                    {RoleFormatter.formatPermissionName(permission)}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
