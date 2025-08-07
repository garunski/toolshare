import { NextRequest, NextResponse } from "next/server";

import { NotificationStats } from "./notificationStats";
import { NotificationManager } from "./sendNotifications";

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle notification request" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process notification request" },
      { status: 500 },
    );
  }
}
