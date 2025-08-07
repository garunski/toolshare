import { NextRequest, NextResponse } from "next/server";

import { AnalyticsReportingService } from "./generateReports";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const timeRange =
      (searchParams.get("timeRange") as "day" | "week" | "month" | "quarter") ||
      "week";

    if (!reportType) {
      return NextResponse.json(
        { error: "Report type required" },
        { status: 400 },
      );
    }

    let report;
    switch (reportType) {
      case "user_activity":
        report =
          await AnalyticsReportingService.generateUserActivityReport(timeRange);
        break;
      case "item_usage":
        report =
          await AnalyticsReportingService.generateItemUsageReport(timeRange);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
