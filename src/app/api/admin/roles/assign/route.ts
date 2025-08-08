import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";
import type { RoleAssignmentRequest, RoleRemovalRequest } from "@/types/roles";

import { RoleAssignmentOperations } from "./performRoleAssignment";

export async function POST(request: NextRequest) {
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

    const body: RoleAssignmentRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.roleId) {
      throw new ApiError(
        400,
        "Missing required fields: userId, roleId",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    const result = await RoleAssignmentOperations.performRoleAssignment(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
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

    const body: RoleRemovalRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.roleId) {
      throw new ApiError(
        400,
        "Missing required fields: userId, roleId",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    await RoleAssignmentOperations.assignRoleToUser(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
