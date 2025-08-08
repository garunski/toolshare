import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { RoleQueryOperations } from "./getRoles";

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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (targetUserId) {
      // Get roles for specific user
      const userRoles = await RoleQueryOperations.getUserRoles(targetUserId);
      return NextResponse.json({
        success: true,
        data: userRoles,
      });
    } else {
      // Get all roles
      const roles = await RoleQueryOperations.getRoles();
      return NextResponse.json({
        success: true,
        data: roles,
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
