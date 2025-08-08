import { NextRequest } from "next/server";

import { validateUserCreationWithGeneratedPassword } from "@/admin/users/validation";
import { createClient } from "@/common/supabase/server";

import { RoleQueryOperations } from "../roles/list/getRoles";
import { RolePermissionOperations } from "../roles/permissions/managePermissions";
import {
  createApiResponse,
  handleApiError,
} from "../roles/responses/responseHandler";

import { performUserCreation } from "./create/performUser";

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

    const hasPermission = await RolePermissionOperations.managePermissions(
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
    const hasPermission = await RolePermissionOperations.managePermissions(
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

    // Validate the request data
    const validatedData = validateUserCreationWithGeneratedPassword(body);

    // Create the user with roles
    const newUser = await performUserCreation(validatedData);

    return createApiResponse({
      message: "User created successfully",
      data: {
        user: newUser,
        generatedPassword: validatedData.password,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
