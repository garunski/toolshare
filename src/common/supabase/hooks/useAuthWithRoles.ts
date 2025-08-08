import { useAuth } from "./useAuth";

export function useAuthWithRoles() {
  const auth = useAuth();
  
  return {
    ...auth,
    hasRole: (role: string) => {
      return auth.user?.user_metadata?.role === role;
    },
    hasAnyRole: (roles: string[]) => {
      return roles.some(role => auth.user?.user_metadata?.role === role);
    },
    checkPermissionSync: (permission: string) => {
      // For now, allow all permissions if user has admin role
      // This can be enhanced later with proper permission checking
      const userRole = auth.user?.user_metadata?.role;
      return userRole === "admin" || userRole === "super_admin";
    },
  };
}
