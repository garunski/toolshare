import { usePermissions } from "@/admin/hooks";
import { useUserRoles } from "@/admin/users/hooks";
import { useAuth } from "@/common/hooks/useAuth";

export function useAuthWithRoles() {
  const auth = useAuth();
  const { roles, hasRole, loading: rolesLoading } = useUserRoles(auth.user?.id);
  const { checkPermission, checkPermissionSync, requiresPermission } =
    usePermissions(auth.user?.id);

  return {
    ...auth,
    roles,
    hasRole,
    isAdmin: hasRole("admin"),
    isModerator: hasRole("moderator"),
    loading: auth.loading || rolesLoading,
    checkPermission,
    checkPermissionSync,
    requiresPermission,
  };
}
