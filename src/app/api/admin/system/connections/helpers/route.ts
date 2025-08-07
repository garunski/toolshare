import { NextRequest, NextResponse } from "next/server";

// Temporarily commented out to avoid circular dependencies
// import { RealtimeConnectionManager } from "@/app/loans/operations/realtimeConnectionClient";

import { ConnectionHelpers } from "./connectionHelpers";

export async function POST(request: NextRequest) {
  try {
    const { action, channelName, event, payload } = await request.json();

    // Temporarily using placeholder to avoid circular dependencies
    const manager = null;
    const connectionManager = ConnectionHelpers.manageConnections(manager);

    switch (action) {
      case "broadcast":
        if (!channelName || !event) {
          return NextResponse.json(
            { error: "Missing required fields: channelName and event" },
            { status: 400 },
          );
        }
        connectionManager.broadcast(channelName, event, payload);
        return NextResponse.json({ success: true });

      case "reconnect":
        connectionManager.reconnect();
        return NextResponse.json({ success: true });

      case "close":
        connectionManager.close();
        return NextResponse.json({ success: true });

      case "validate":
        const isValid = connectionManager.validate();
        return NextResponse.json({ success: true, isValid });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use 'broadcast', 'reconnect', 'close', or 'validate'",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error managing connections:", error);
    return NextResponse.json(
      { error: "Failed to manage connections" },
      { status: 500 },
    );
  }
}
