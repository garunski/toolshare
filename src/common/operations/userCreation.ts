import { createClient } from "@/common/supabase/client";
import type { UserCreationRequest, UserWithRoles } from "@/types/roles";

import { RoleAssignmentOperations } from "../../app/api/admin/roles/assign/performRoleAssignment";

export class UserCreationOperations {
  // Create a new user with profile and optional role assignments
  static async createUserWithRoles(
    request: UserCreationRequest,
  ): Promise<UserWithRoles> {
    const supabase = createClient();
    const { data: currentUser } = await supabase.auth.getUser();

    // Create the user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: request.email,
        password: request.password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: {
          first_name: request.firstName,
          last_name: request.lastName,
        },
      });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("User creation failed - no user data returned");
    }

    // Create the user profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        first_name: request.firstName,
        last_name: request.lastName,
        phone: request.phone || null,
        address: request.address || null,
        bio: request.bio || null,
      })
      .select()
      .single();

    if (profileError) {
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Assign roles if provided
    const userRoles = [];
    if (request.roleIds && request.roleIds.length > 0) {
      for (const roleId of request.roleIds) {
        try {
          const userRole = await RoleAssignmentOperations.performRoleAssignment(
            {
              userId: authData.user.id,
              roleId,
              expiresAt: request.roleExpiresAt || undefined,
            },
          );
          userRoles.push(userRole);
        } catch (error) {
          console.error(`Failed to assign role ${roleId}:`, error);
          // Continue with other roles even if one fails
        }
      }
    }

    // Fetch the complete user data with roles
    const { data: userWithRoles, error: fetchError } = await supabase
      .from("profiles")
      .select(
        `
        *,
        user_roles!inner(
          *,
          roles(*)
        )
      `,
      )
      .eq("id", authData.user.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch user data: ${fetchError.message}`);
    }

    // Transform the data to match UserWithRoles type
    const transformedUser: UserWithRoles = {
      id: userWithRoles.id,
      first_name: userWithRoles.first_name,
      last_name: userWithRoles.last_name,
      email: authData.user.email || "",
      phone: userWithRoles.phone,
      address: userWithRoles.address,
      bio: userWithRoles.bio,
      avatar_url: userWithRoles.avatar_url,
      created_at: userWithRoles.created_at,
      updated_at: userWithRoles.updated_at,
      roles: userWithRoles.user_roles.map((ur: any) => ur.roles),
    };

    return transformedUser;
  }

  /**
   * Generate a secure random password for new users
   */
  static generateSecurePassword(): string {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}
