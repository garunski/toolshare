import { NextRequest, NextResponse } from "next/server";

import { AnalyticsDataCollector } from "./collectAnalytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      eventType,
      properties,
      userId,
      pageName,
      itemId,
      query,
      resultsCount,
      filters,
    } = body;

    switch (action) {
      case "track_event":
        if (!eventType) {
          return NextResponse.json(
            { error: "Event type required" },
            { status: 400 },
          );
        }
        AnalyticsDataCollector.trackEvent(eventType, properties || {}, userId);
        break;

      case "track_page_view":
        if (!pageName) {
          return NextResponse.json(
            { error: "Page name required" },
            { status: 400 },
          );
        }
        AnalyticsDataCollector.trackPageView(pageName, userId);
        break;

      case "track_item_interaction":
        if (!itemId || !properties?.action) {
          return NextResponse.json(
            { error: "Item ID and action required" },
            { status: 400 },
          );
        }
        AnalyticsDataCollector.trackItemInteraction(
          properties.action,
          itemId,
          userId,
        );
        break;

      case "track_search":
        if (!query || resultsCount === undefined) {
          return NextResponse.json(
            { error: "Query and results count required" },
            { status: 400 },
          );
        }
        AnalyticsDataCollector.trackSearch(
          query,
          resultsCount,
          filters || {},
          userId,
        );
        break;

      case "flush":
        await AnalyticsDataCollector.flushEvents();
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process analytics event" },
      { status: 500 },
    );
  }
}
