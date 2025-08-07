import { createClient } from "@/common/supabase/server";
import type { Role, UserRole } from "@/types/roles";

export class RoleQueryOperations {
  /**
   * Get all roles with permissions
   */
  static async getRoles(): Promise<Role[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("roles")
      .select(
        `
        *,
        role_permissions (
          permission_id,
          permissions (
            name,
            description
          )
        )
      `,
      )
      .order("name");

    if (error) throw new Error(`Failed to fetch roles: ${error.message}`);
    return data || [];
  }

  /**
   * Get user roles
   */
  static async getUserRoles(
    userId: string,
  ): Promise<Array<UserRole & { roles: Role }>> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_roles")
      .select(
        `
        *,
        roles (
          id,
          name,
          description
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch user roles: ${error.message}`);
    return data || [];
  }

  /**
   * Get all users with roles
   */
  static async getAllUsersWithRoles() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        created_at,
        user_roles (
          role_id,
          roles (
            name,
            description
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    return data || [];
  }

  /**
   * Get all roles with permissions (alias for getRoles)
   */
  static async getAllRolesWithPermissions(): Promise<Role[]> {
    return this.getRoles();
  }
}
