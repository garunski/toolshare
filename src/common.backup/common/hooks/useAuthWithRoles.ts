import { useAuth } from "@/common/hooks/useAuth";
import { usePermissions } from "@/common/hooks/usePermissions";
import { useUserRoles } from "@/common/hooks/useUserRoles";

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
