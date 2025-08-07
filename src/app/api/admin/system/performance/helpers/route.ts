import { NextRequest, NextResponse } from "next/server";

import { PerformanceHelpers } from "./performanceHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const timeRange = parseInt(searchParams.get("timeRange") || "86400000"); // 24 hours default

    if (action === "data") {
      const data = await PerformanceHelpers.getPerformanceData(timeRange);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get performance data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    if (action === "format") {
      const formatted = PerformanceHelpers.formatPerformanceData(
        body.metrics || [],
      );
      return NextResponse.json(formatted);
    }

    if (action === "calculate") {
      const summary = PerformanceHelpers.calculatePerformanceMetrics(
        body.metrics || [],
        body.timeRange || 24 * 60 * 60 * 1000,
      );
      return NextResponse.json(summary);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process performance request" },
      { status: 500 },
    );
  }
}
