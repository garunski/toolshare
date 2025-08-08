import { createClient } from "@/common/supabase/server";
import type { PermissionCheck } from "@/types/roles";

export class PerformRolePermissions {
  /**
   * Check if user has specific permission
   */
  static async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<PermissionCheck> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("user_has_permission", {
      user_uuid: userId,
      permission_name: permissionName,
    });

    if (error) throw new Error(`Permission check failed: ${error.message}`);

    const roles = await this.getUserRoles(userId);
    const roleNames = roles.map((r) => r.name);

    return {
      hasPermission: data,
      roles: roleNames,
      reason: data ? undefined : `User lacks ${permissionName} permission`,
    };
  }

  /**
   * Get user roles for specific user
   */
  static async getUserRoles(userId: string): Promise<any[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_roles")
      .select(
        `
        roles(*)
      `,
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .or("expires_at.is.null,expires_at.gt.now()");

    if (error) throw new Error(`Failed to fetch user roles: ${error.message}`);

    return data.map((ur) => ur.roles).flat();
  }
}
