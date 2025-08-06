import { createClient } from "@/common/supabase/client";
import type { Role, RoleWithPermissions, UserWithRoles } from "@/types/roles";

export class RoleQueryOperations {
  /**
   * Get all roles with their permissions
   */
  static async getAllRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from("roles").select(`
        *,
        role_permissions!inner(
          permissions(*)
        )
      `);

    if (error) throw new Error(`Failed to fetch roles: ${error.message}`);

    return data.map((role) => ({
      ...role,
      permissions: role.role_permissions
        .map((rp: any) => rp.permissions)
        .flat(),
    }));
  }

  /**
   * Get user roles for specific user
   */
  static async getUserRoles(userId: string): Promise<Role[]> {
    const supabase = createClient();
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

  /**
   * Get all users with their roles (admin function)
   */
  static async getAllUsersWithRoles(): Promise<UserWithRoles[]> {
    const supabase = createClient();

    // First get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    // Then get all user roles with roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from("user_roles")
      .select(
        `
        user_id,
        roles(*)
      `,
      )
      .eq("is_active", true)
      .or("expires_at.is.null,expires_at.gt.now()");

    if (userRolesError) {
      throw new Error(`Failed to fetch user roles: ${userRolesError.message}`);
    }

    // Group roles by user_id
    const userRolesMap = new Map<string, any[]>();
    userRoles.forEach((ur) => {
      if (!userRolesMap.has(ur.user_id)) {
        userRolesMap.set(ur.user_id, []);
      }
      userRolesMap.get(ur.user_id)!.push(ur.roles);
    });

    // Combine profiles with their roles
    return profiles.map((profile) => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: "", // Will be populated from auth if needed
      phone: undefined,
      address: undefined,
      bio: undefined,
      avatar_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: userRolesMap.get(profile.id) || [],
    }));
  }
}
