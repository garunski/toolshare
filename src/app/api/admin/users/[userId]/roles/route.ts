import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { RoleAssignmentOperations } from "../../../roles/assign/performRoleAssignment";
import {
  validateRoleAssignment,
  validateRoleRemoval,
} from "../../../roles/assign/validation";
import { RoleQueryOperations } from "../../../roles/list/getRoles";
import { RolePermissionOperations } from "../../../roles/permissions/managePermissions";

type RouteParams = {
  params: Promise<{
    userId: string;
  }>;
};

async function validateUserPermission(permission: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const hasPermission = await RolePermissionOperations.managePermissions(
    user.id,
    permission,
  );

  if (!hasPermission.hasPermission) {
    throw new ApiError(
      403,
      "Insufficient permissions",
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  return user;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const { userId } = await params;

    // Validate dynamic parameter
    if (!userId) {
      throw new ApiError(400, "Invalid user ID parameter", "INVALID_USER_ID");
    }

    await validateUserPermission("manage_users");
    const userRoles = await RoleQueryOperations.getUserRoles(userId);

    return NextResponse.json({
      success: true,
      data: userRoles,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const { userId } = await params;

    // Validate dynamic parameter
    if (!userId) {
      throw new ApiError(400, "Invalid user ID parameter", "INVALID_USER_ID");
    }

    await validateUserPermission("assign_roles");
    const body = await request.json();
    const validatedData = validateRoleAssignment({
      userId,
      roleId: body.roleId,
      expiresAt: body.expiresAt,
    });
    const assignedRole =
      await RoleAssignmentOperations.performRoleAssignment(validatedData);
    return NextResponse.json({
      success: true,
      data: assignedRole,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const { userId } = await params;

    // Validate dynamic parameter
    if (!userId) {
      throw new ApiError(400, "Invalid user ID parameter", "INVALID_USER_ID");
    }

    await validateUserPermission("assign_roles");
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");
    if (!roleId) {
      throw new ApiError(400, "Role ID is required", "MISSING_ROLE_ID");
    }
    const validatedData = validateRoleRemoval({
      userId,
      roleId,
    });
    await RoleAssignmentOperations.assignRoleToUser(validatedData);
    return NextResponse.json({
      success: true,
      message: "Role removed successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
