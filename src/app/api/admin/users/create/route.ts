import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { generateSecurePassword, performUserCreation } from "./performUser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Generate password if not provided
    if (!body.password) {
      body.password = generateSecurePassword();
    }

    const result = await performUserCreation(body);

    if (!result.success) {
      throw new ApiError(
        400,
        result.error || "User creation failed",
        "USER_CREATION_FAILED",
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}
