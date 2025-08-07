import { NextRequest, NextResponse } from "next/server";

import { PerformanceMonitor } from "./monitorPerformance";

export async function GET(request: NextRequest) {
  try {
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

    if (action === "track") {
      const result = await PerformanceMonitor.trackPerformanceMetrics(body);
      return NextResponse.json(result);
    }

    if (action === "analyze") {
      const timeRange = body.timeRange || 24 * 60 * 60 * 1000;
      const analysis = await PerformanceMonitor.analyzePerformance(timeRange);
      return NextResponse.json(analysis);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process performance request" },
      { status: 500 },
    );
  }
}
