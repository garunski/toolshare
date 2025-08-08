import { useCallback } from "react";

import { useUserRoles } from "@/admin/users/hooks";
import type { PermissionCheck } from "@/types/roles";

interface UsePermissionsReturn {
  checkPermission: (permissionName: string) => Promise<PermissionCheck>;
  checkPermissionSync: (permissionName: string) => Promise<boolean>;
  requiresPermission: (
    permissionName: string,
    fallback?: () => void,
  ) => Promise<boolean>;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
}

export function usePermissions(userId?: string): UsePermissionsReturn {
  const { roles, hasRole, hasPermission } = useUserRoles(userId);

  const checkPermission = useCallback(
    async (permissionName: string): Promise<PermissionCheck> => {
      try {
        const result = await hasPermission(permissionName);
        return result;
      } catch (err) {
        return {
          hasPermission: false,
          roles: [],
          reason:
            err instanceof Error ? err.message : "Permission check failed",
        };
      }
    },
    [hasPermission],
  );

  const checkPermissionSync = useCallback(
    async (permissionName: string): Promise<boolean> => {
      try {
        const result = await hasPermission(permissionName);
        return result.hasPermission;
      } catch (err) {
        return false;
      }
    },
    [hasPermission],
  );

  const requiresPermission = useCallback(
    async (permissionName: string, fallback?: () => void): Promise<boolean> => {
      const result = await checkPermission(permissionName);

      if (!result.hasPermission && fallback) {
        fallback();
      }

      return result.hasPermission;
    },
    [checkPermission],
  );

  return {
    checkPermission,
    checkPermissionSync,
    requiresPermission,
    isAdmin: hasRole("admin"),
    isModerator: hasRole("moderator"),
    isUser: hasRole("user"),
  };
}
