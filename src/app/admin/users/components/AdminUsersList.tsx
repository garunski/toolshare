"use client";

import { useEffect, useState } from "react";

import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";
import type { Role, UserWithRoles } from "@/types/roles";

import { CreateUserForm } from "./CreateUserForm";
import { UserCard } from "./UserCard";

export function AdminUsersList() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/users");
        const usersResult = await usersResponse.json();

        if (!usersResponse.ok) {
          throw new Error(usersResult.error || "Failed to fetch users");
        }

        setUsers(usersResult.data || []);

        // Fetch roles
        const rolesResponse = await fetch("/api/admin/roles");
        const rolesResult = await rolesResponse.json();

        if (!rolesResponse.ok) {
          throw new Error(rolesResult.error || "Failed to fetch roles");
        }

        setRoles(rolesResult.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleUserCreated = () => {
    setShowCreateForm(false);
    // Refresh the users list
    window.location.reload();
  };

  const handleRoleUpdated = () => {
    // Refresh the users list
    window.location.reload();
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">Users</Text>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          Create User
        </Button>
      </div>

      {showCreateForm && (
        <CreateUserForm
          roles={roles}
          onUserCreated={handleUserCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            availableRoles={roles}
            onRoleUpdated={handleRoleUpdated}
          />
        ))}
      </div>
    </div>
  );
}
