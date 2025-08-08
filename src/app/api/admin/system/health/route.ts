import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { SystemHealthMonitor } from "./monitorHealth";

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
    const action = searchParams.get("action");

    if (action === "status") {
      const status = await SystemHealthMonitor.getSystemHealthStatus();
      return NextResponse.json(status);
    }

    if (action === "full") {
      const healthData = await SystemHealthMonitor.getSystemHealthStatus();
      return NextResponse.json(healthData);
    }

    // Default health check
    const healthData = await SystemHealthMonitor.getSystemHealthStatus();
    return NextResponse.json(healthData);
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "check") {
      const healthData = await SystemHealthMonitor.getSystemHealthStatus();
      return NextResponse.json(healthData);
    }

    throw new ApiError(400, "Invalid action", "INVALID_ACTION");
  } catch (error) {
    return handleApiError(error);
  }
}
