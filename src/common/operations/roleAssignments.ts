import { createClient } from "@/common/supabase/client";
import type {
  RoleAssignmentRequest,
  RoleRemovalRequest,
  UserRole,
} from "@/types/roles";

export class RoleAssignmentOperations {
  /**
   * Assign role to user
   */
  static async assignUserRole(
    request: RoleAssignmentRequest,
  ): Promise<UserRole> {
    const supabase = createClient();
    const { data: currentUser } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: request.userId,
        role_id: request.roleId,
        assigned_by: currentUser?.user?.id,
        expires_at: request.expiresAt || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to assign role: ${error.message}`);

    return data;
  }

  /**
   * Remove role from user
   */
  static async removeUserRole(request: RoleRemovalRequest): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_roles")
      .update({ is_active: false })
      .eq("user_id", request.userId)
      .eq("role_id", request.roleId);

    if (error) throw new Error(`Failed to remove role: ${error.message}`);
  }
}
