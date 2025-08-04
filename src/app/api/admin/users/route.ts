import { NextRequest } from "next/server";

import {
  createApiResponse,
  handleApiError,
} from "@/common/operations/apiResponseHandler";
import { RolePermissionOperations } from "@/common/operations/rolePermissions";
import { RoleQueryOperations } from "@/common/operations/roleQueries";
import { createClient } from "@/common/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hasPermission = await RolePermissionOperations.hasPermission(
      user.id,
      "manage_users",
    );

    if (!hasPermission.hasPermission) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const users = await RoleQueryOperations.getAllUsersWithRoles();

    return createApiResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check admin permissions
    const hasPermission = await RolePermissionOperations.hasPermission(
      user.id,
      "manage_users",
    );

    if (!hasPermission.hasPermission) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, roleIds } = body;

    // TODO: Implement user creation logic
    // This would involve creating a Supabase Auth user and assigning roles

    return createApiResponse({
      message: "User creation not yet implemented",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
