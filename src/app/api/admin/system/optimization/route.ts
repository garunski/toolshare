import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { QueryOptimizationService } from "./optimizeQueries";

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

    const result = await QueryOptimizationService.optimizeQueries();
    return NextResponse.json(result);
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
    const { action } = body;

    switch (action) {
      case "analyze":
        const analysis =
          await QueryOptimizationService.analyzeQueryPerformance();
        return NextResponse.json(analysis);
      case "suggest":
        const suggestions =
          await QueryOptimizationService.suggestQueryOptimizations();
        return NextResponse.json(suggestions);
      case "report":
        const report = await QueryOptimizationService.getOptimizationReport();
        return NextResponse.json(report);
      default:
        throw new ApiError(400, "Invalid action", "INVALID_ACTION");
    }
  } catch (error) {
    return handleApiError(error);
  }
}
