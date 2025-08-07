import { NextRequest, NextResponse } from "next/server";

import { ConnectionHelpers } from "./connectionHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const connectionId = searchParams.get("connectionId");

    if (action === "stats") {
      const stats = await ConnectionHelpers.getConnectionStats();
      return NextResponse.json(stats);
    }

    if (action === "manage" && userId) {
      const connections = await ConnectionHelpers.manageConnections(userId);
      return NextResponse.json(connections);
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle connection request" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");
    const action = searchParams.get("action") as "connect" | "disconnect";

    if (!connectionId || !action) {
      return NextResponse.json(
        { error: "Missing connectionId or action" },
        { status: 400 },
      );
    }

    const result = await ConnectionHelpers.handleConnection(
      connectionId,
      action,
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle connection action" },
      { status: 500 },
    );
  }
}
