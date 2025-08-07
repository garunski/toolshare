import { NextRequest, NextResponse } from "next/server";

import { OptimizationHelpers } from "./optimizationHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      const stats = await OptimizationHelpers.getQueryPerformanceStats();
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get optimization data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    if (action === "format-plan") {
      const formattedPlan = OptimizationHelpers.formatQueryPlan(body);
      return NextResponse.json(formattedPlan);
    }

    if (action === "analyze-metrics") {
      const analysis = OptimizationHelpers.analyzeQueryMetrics(body);
      return NextResponse.json(analysis);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process optimization request" },
      { status: 500 },
    );
  }
}
