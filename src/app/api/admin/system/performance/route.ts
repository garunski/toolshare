import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { PerformanceMonitor } from "./monitorPerformance";

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
    const timeRange = parseInt(searchParams.get("timeRange") || "86400000"); // 24 hours default

    if (action === "monitor") {
      const data = await PerformanceMonitor.monitorPerformance();
      return NextResponse.json(data);
    }

    if (action === "analyze") {
      const analysis = await PerformanceMonitor.analyzePerformance(timeRange);
      return NextResponse.json(analysis);
    }

    if (action === "report") {
      const report = await PerformanceMonitor.getPerformanceReport();
      return NextResponse.json(report);
    }

    // Default: get performance data
    const data = await PerformanceMonitor.monitorPerformance();
    return NextResponse.json(data);
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
    const body = await request.json();

    if (action === "track") {
      const result = await PerformanceMonitor.trackPerformanceMetrics(body);
      return NextResponse.json(result);
    }

    if (action === "analyze") {
      const timeRange = body.timeRange || 24 * 60 * 60 * 1000;
      const analysis = await PerformanceMonitor.analyzePerformance(timeRange);
      return NextResponse.json(analysis);
    }

    throw new ApiError(400, "Invalid action", "INVALID_ACTION");
  } catch (error) {
    return handleApiError(error);
  }
}
