import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { RolePermissionOperations } from "./managePermissions";

export async function GET(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const adminUserId = request.headers.get("x-user-id");
    if (!adminUserId) {
      throw new ApiError(
        401,
        "Admin user not authenticated",
        "ADMIN_UNAUTHORIZED",
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const permissionName = searchParams.get("permissionName");

    if (!userId || !permissionName) {
      throw new ApiError(
        400,
        "Missing required parameters: userId, permissionName",
        "MISSING_REQUIRED_PARAMETERS",
      );
    }

    const result = await RolePermissionOperations.managePermissions(
      userId,
      permissionName,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const adminUserId = request.headers.get("x-user-id");
    if (!adminUserId) {
      throw new ApiError(
        401,
        "Admin user not authenticated",
        "ADMIN_UNAUTHORIZED",
      );
    }

    const body = await request.json();
    const { roleId, permissionIds } = body;

    if (!roleId || !Array.isArray(permissionIds)) {
      throw new ApiError(
        400,
        "Missing required fields: roleId, permissionIds",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    await RolePermissionOperations.updateRolePermissions(roleId, permissionIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
