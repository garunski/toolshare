import { createClient } from "@/common/supabase/server";
import type { UserCreationRequest, UserWithRoles } from "@/types/roles";

export interface UserCreationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function performUserCreation(
  request: UserCreationRequest,
): Promise<UserCreationResult<UserWithRoles>> {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: request.email,
        password: request.password,
        email_confirm: true,
        user_metadata: {
          first_name: request.firstName,
          last_name: request.lastName,
        },
      });

    if (authError) {
      return {
        success: false,
        error: `Failed to create user: ${authError.message}`,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "User creation failed - no user data returned",
      };
    }

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
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: `Failed to create profile: ${profileError.message}`,
      };
    }

    if (request.roleIds && request.roleIds.length > 0) {
      for (const roleId of request.roleIds) {
        try {
          await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role_id: roleId,
            expires_at: request.roleExpiresAt || null,
          });
        } catch (error) {
          console.error(`Failed to assign role ${roleId}:`, error);
        }
      }
    }

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
      return {
        success: false,
        error: `Failed to fetch user data: ${fetchError.message}`,
      };
    }

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

    return {
      success: true,
      data: transformedUser,
    };
  } catch (error) {
    console.error("User creation error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export function generateSecurePassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}
