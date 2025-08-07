import { NextRequest, NextResponse } from "next/server";

import { QueryOptimizationService } from "./optimizeQueries";

export async function GET(request: NextRequest) {
  try {
    const result = await QueryOptimizationService.optimizeQueries();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to optimize queries" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "analyze":
        const analysis =
          await QueryOptimizationService.analyzeQueryPerformance();
        return NextResponse.json(analysis);
      case "suggest":
        const suggestions =
          await QueryOptimizationService.suggestQueryOptimizations();
        return NextResponse.json(suggestions);
      case "report":
        const report = await QueryOptimizationService.getOptimizationReport();
        return NextResponse.json(report);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process optimization request" },
      { status: 500 },
    );
  }
}
