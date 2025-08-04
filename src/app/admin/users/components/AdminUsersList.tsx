"use client";

import { useEffect, useState } from "react";

import { RoleFormatter } from "@/common/formatters/roleFormatter";
import { Badge } from "@/primitives/badge";
import { Text } from "@/primitives/text";
import type { UserWithRoles } from "@/types/roles";

export function AdminUsersList() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch users");
        }

        setUsers(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white p-4 shadow">
            <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
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

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Text className="text-gray-600">No users found</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <Text className="font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </Text>
              {user.email && (
                <Text className="text-sm text-gray-500">{user.email}</Text>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {user.roles.length === 0 ? (
                <Badge>No roles</Badge>
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
        </div>
      ))}
    </div>
  );
}
