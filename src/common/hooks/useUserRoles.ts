import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/common/hooks/useAuth";
// Removed direct operation imports - now using API routes
import type { PermissionCheck, Role } from "@/types/roles";

interface UseUserRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => Promise<PermissionCheck>;
  refetch: () => Promise<void>;
}

export function useUserRoles(userId?: string): UseUserRolesReturn {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/roles/queries?userId=${targetUserId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const userRoles = await response.json();
      setRoles(userRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback(
    (roleName: string): boolean => {
      return roles.some((role) => role.name === roleName);
    },
    [roles],
  );

  const hasPermission = useCallback(
    async (permissionName: string): Promise<PermissionCheck> => {
      if (!targetUserId) {
        return {
          hasPermission: false,
          roles: [],
          reason: "No user ID provided",
        };
      }

      try {
        const response = await fetch("/api/admin/roles/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: targetUserId,
            permissionName,
          }),
        });

        if (!response.ok) {
          throw new Error("Permission check failed");
        }

        return await response.json();
      } catch (err) {
        return {
          hasPermission: false,
          roles: [],
          reason:
            err instanceof Error ? err.message : "Permission check failed",
        };
      }
    },
    [targetUserId],
  );

  return {
    roles,
    loading,
    error,
    hasRole,
    hasPermission,
    refetch: fetchRoles,
  };
}
