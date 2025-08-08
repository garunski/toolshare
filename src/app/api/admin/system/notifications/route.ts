import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { NotificationStats } from "./notificationStats";
import { NotificationManager } from "./sendNotifications";

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
    const notificationId = searchParams.get("notificationId");
    const userId = searchParams.get("userId");

    if (action === "stats") {
      const stats = await NotificationStats.getNotificationStats();
      return NextResponse.json(stats);
    }

    if (action === "get_user_notifications" && userId) {
      const result = await NotificationManager.manageNotifications(
        "get_user_notifications",
        undefined,
        userId,
      );
      return NextResponse.json(result);
    }

    throw new ApiError(
      400,
      "Invalid action or missing parameters",
      "INVALID_ACTION_OR_PARAMETERS",
    );
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

    if (action === "send") {
      const result = await NotificationManager.sendNotifications(body);
      return NextResponse.json(result);
    }

    if (action === "broadcast") {
      const { notification, userIds } = body;
      const result = await NotificationManager.broadcastNotification(
        notification,
        userIds,
      );
      return NextResponse.json(result);
    }

    if (action === "mark_read" && body.notificationId) {
      const result = await NotificationManager.manageNotifications(
        "mark_read",
        body.notificationId,
      );
      return NextResponse.json(result);
    }

    if (action === "delete" && body.notificationId) {
      const result = await NotificationManager.manageNotifications(
        "delete",
        body.notificationId,
      );
      return NextResponse.json(result);
    }

    throw new ApiError(
      400,
      "Invalid action or missing parameters",
      "INVALID_ACTION_OR_PARAMETERS",
    );
  } catch (error) {
    return handleApiError(error);
  }
}
