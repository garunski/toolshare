"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/common/hooks/useAuth";
import { usePermissions } from "@/common/hooks/usePermissions";
import { useUserRoles } from "@/common/hooks/useUserRoles";

interface AdminProtectionProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function AdminProtection({
  children,
  requiredPermission = "manage_users",
}: AdminProtectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { checkPermissionSync, isAdmin } = usePermissions(user?.id);
  const { roles, loading: rolesLoading } = useUserRoles(user?.id);
  const router = useRouter();

  useEffect(() => {
    if (authLoading || rolesLoading) return;

    if (!user) {
      router.push("/auth/login?redirect=/admin");
      return;
    }

    // Check if user has admin role or the required permission
    const hasAdminRole = roles.some((role) => role.name === "admin");

    if (hasAdminRole) {
      return; // Admin role grants access
    }

    // Check specific permission if not admin
    checkPermissionSync(requiredPermission).then((hasRequiredPermission) => {
      if (!hasRequiredPermission) {
        router.push("/dashboard?error=unauthorized");
      }
    });
  }, [
    user,
    authLoading,
    rolesLoading,
    roles,
    checkPermissionSync,
    requiredPermission,
    router,
  ]);

  if (authLoading || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user has admin role
  const hasAdminRole = roles.some((role) => role.name === "admin");
  if (!hasAdminRole) {
    return null; // Will be handled by the useEffect
  }

  return <>{children}</>;
}
