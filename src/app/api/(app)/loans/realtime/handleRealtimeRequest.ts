import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error-handler";

import { RealtimeConnectionManager } from "../../../../(app)/loans/operations/realtimeConnectionOperations";

const connectionStatusSchema = z.object({
  action: z.enum(["getStatus", "closeAll", "getChannels", "getSubscriptions"]),
});

const subscriptionSchema = z.object({
  action: z.enum(["subscribe", "unsubscribe"]),
  channelName: z.string(),
  table: z.string(),
  event: z.enum(["INSERT", "UPDATE", "DELETE", "*"]),
  filter: z.string().optional(),
});

const broadcastSchema = z.object({
  action: z.literal("broadcast"),
  channelName: z.string(),
  event: z.string(),
  payload: z.any(),
});

const adminSubscriptionSchema = z.object({
  action: z.enum(["subscribeToAdmin", "subscribeToUser"]),
  userId: z.string().optional(),
});

export async function handleRealtimeRequest(body: any) {
  // Handle connection status requests
  if (
    body.action &&
    ["getStatus", "closeAll", "getChannels", "getSubscriptions"].includes(
      body.action,
    )
  ) {
    const validatedData = connectionStatusSchema.parse(body);

    switch (validatedData.action) {
      case "getStatus":
        return NextResponse.json(
          RealtimeConnectionManager.getConnectionStatus(),
        );
      case "closeAll":
        RealtimeConnectionManager.closeAllConnections();
        return NextResponse.json({ success: true });
      case "getChannels":
        return NextResponse.json(
          Array.from(RealtimeConnectionManager.getChannels().keys()),
        );
      case "getSubscriptions":
        return NextResponse.json(
          Array.from(RealtimeConnectionManager.getSubscriptions().keys()),
        );
    }
  }

  // Handle subscription requests
  if (body.action && ["subscribe", "unsubscribe"].includes(body.action)) {
    const validatedData = subscriptionSchema.parse(body);

    if (validatedData.action === "subscribe") {
      const unsubscribe = RealtimeConnectionManager.subscribe(
        validatedData.channelName,
        {
          table: validatedData.table,
          event: validatedData.event,
          filter: validatedData.filter,
          callback: (payload) => {
            // This would typically be handled by the client
            console.log("Received realtime update:", payload);
          },
        },
      );
      return NextResponse.json({ success: true, unsubscribe: true });
    }
  }

  // Handle broadcast requests
  if (body.action === "broadcast") {
    const validatedData = broadcastSchema.parse(body);
    RealtimeConnectionManager.broadcast(
      validatedData.channelName,
      validatedData.event,
      validatedData.payload,
    );
    return NextResponse.json({ success: true });
  }

  // Handle admin/user subscription requests
  if (
    body.action &&
    ["subscribeToAdmin", "subscribeToUser"].includes(body.action)
  ) {
    const validatedData = adminSubscriptionSchema.parse(body);

    if (validatedData.action === "subscribeToAdmin") {
      const unsubscribe = RealtimeConnectionManager.subscribeToAdminUpdates(
        (data) => {
          console.log("Admin update received:", data);
        },
      );
      return NextResponse.json({ success: true, unsubscribe: true });
    }

    if (validatedData.action === "subscribeToUser" && validatedData.userId) {
      const unsubscribe = RealtimeConnectionManager.subscribeToUserUpdates(
        validatedData.userId,
        (data) => {
          console.log("User update received:", data);
        },
      );
      return NextResponse.json({ success: true, unsubscribe: true });
    }
  }

  throw new ApiError(400, "Invalid action specified", "INVALID_ACTION");
}
