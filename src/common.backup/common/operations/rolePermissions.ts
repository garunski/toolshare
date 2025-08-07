import { createClient } from "@/common/supabase/client";
import type { PermissionCheck } from "@/types/roles";

import { RoleQueryOperations } from "./roleQueries";

export class RolePermissionOperations {
  /**
   * Check if user has specific permission
   */
  static async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<PermissionCheck> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("user_has_permission", {
      user_uuid: userId,
      permission_name: permissionName,
    });

    if (error) throw new Error(`Permission check failed: ${error.message}`);

    const roles = await RoleQueryOperations.getUserRoles(userId);
    const roleNames = roles.map((r) => r.name);

    return {
      hasPermission: data,
      roles: roleNames,
      reason: data ? undefined : `User lacks ${permissionName} permission`,
    };
  }
}
