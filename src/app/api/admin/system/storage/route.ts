import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { OfflineStorageManager } from "./manageOfflineStorage";

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
    const type = searchParams.get("type");

    if (action === "get") {
      const result = await OfflineStorageManager.manageOfflineStorage(
        "get",
        undefined,
        type || undefined,
      );
      return NextResponse.json(result);
    }

    if (action === "stats") {
      const result = await OfflineStorageManager.manageOfflineStorage("stats");
      return NextResponse.json(result);
    }

    if (action === "sync") {
      const result = await OfflineStorageManager.syncOfflineData();
      return NextResponse.json(result);
    }

    throw new ApiError(400, "Invalid action", "INVALID_ACTION");
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

    if (action === "store") {
      const result = await OfflineStorageManager.manageOfflineStorage(
        "store",
        body,
      );
      return NextResponse.json(result);
    }

    if (action === "sync") {
      const result = await OfflineStorageManager.syncOfflineData();
      return NextResponse.json(result);
    }

    if (action === "clear") {
      const result = await OfflineStorageManager.manageOfflineStorage("clear");
      return NextResponse.json(result);
    }

    if (action === "handle") {
      const { handleAction, item } = body;
      const result = await OfflineStorageManager.handleOfflineData(
        handleAction,
        item,
      );
      return NextResponse.json(result);
    }

    throw new ApiError(400, "Invalid action", "INVALID_ACTION");
  } catch (error) {
    return handleApiError(error);
  }
}
