import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { RoleQueryOperations } from "./list/getRoles";
import { RolePermissionOperations } from "./permissions/managePermissions";

export async function GET(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    const hasPermission = await RolePermissionOperations.managePermissions(
      userId,
      "view_roles",
    );

    if (!hasPermission.hasPermission) {
      throw new ApiError(403, "Insufficient permissions");
    }

    const roles = await RoleQueryOperations.getAllRolesWithPermissions();

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    const hasPermission = await RolePermissionOperations.managePermissions(
      userId,
      "manage_roles",
    );

    if (!hasPermission.hasPermission) {
      throw new ApiError(403, "Insufficient permissions");
    }

    const body = await request.json();
    const { name, description, isSystemRole } = body;

    const supabase = await createClient();

    // Create new role
    const { data, error } = await supabase
      .from("roles")
      .insert({
        name,
        description,
        is_system_role: isSystemRole || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
