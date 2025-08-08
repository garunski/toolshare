import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { ApiRateLimiterOperations } from "./rateLimiter";

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
    const action = searchParams.get("action") || "default";

    const rateLimitInfo = await ApiRateLimiterOperations.getRateLimitInfo(
      adminUserId,
      action,
    );

    return NextResponse.json({
      success: true,
      data: rateLimitInfo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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

    const body = await request.json();
    const { action, endpoint, method, statusCode } = body;

    if (!action || !endpoint || !method || !statusCode) {
      throw new ApiError(
        400,
        "Missing required fields: action, endpoint, method, statusCode",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    await ApiRateLimiterOperations.recordRequest(
      adminUserId,
      action,
      endpoint,
      method,
      statusCode,
    );

    return NextResponse.json({
      success: true,
      message: "Request recorded successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
