import { createClient } from "@/common/supabase/server";
import type { PermissionCheck } from "@/types/roles";

import { RoleQueryOperations } from "../list/getRoles";

export class RolePermissionOperations {
  /**
   * Check if user has specific permission
   */
  static async managePermissions(
    userId: string,
    permissionName: string,
  ): Promise<PermissionCheck> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("user_has_permission", {
      user_uuid: userId,
      permission_name: permissionName,
    });

    if (error) throw new Error(`Permission check failed: ${error.message}`);

    const roles = await RoleQueryOperations.getUserRoles(userId);
    const roleNames = roles.map((r) => r.roles?.name).filter(Boolean);

    return {
      hasPermission: data,
      roles: roleNames,
      reason: data ? undefined : `User lacks ${permissionName} permission`,
    };
  }

  /**
   * Update role permissions
   */
  static async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const supabase = await createClient();

    // First, remove existing permissions for this role
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) {
      throw new Error(
        `Failed to remove existing permissions: ${deleteError.message}`,
      );
    }

    // Then, add new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      const { error: insertError } = await supabase
        .from("role_permissions")
        .insert(rolePermissions);

      if (insertError) {
        throw new Error(`Failed to add permissions: ${insertError.message}`);
      }
    }
  }
}
