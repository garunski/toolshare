import { NextRequest, NextResponse } from "next/server";

import { SystemHealthMonitor } from "./monitorHealth";

export async function GET(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: "Failed to check system health" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "check") {
      const healthData = await SystemHealthMonitor.getSystemHealthStatus();
      return NextResponse.json(healthData);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to perform health check" },
      { status: 500 },
    );
  }
}
