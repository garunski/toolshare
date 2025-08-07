import { NextRequest, NextResponse } from "next/server";

import { RateLimitHelpers } from "./rateLimitHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const identifier = searchParams.get("identifier");
    const days = parseInt(searchParams.get("days") || "7");

    if (action === "check" && identifier) {
      const rateLimitInfo = await RateLimitHelpers.checkRateLimit(identifier);
      return NextResponse.json(rateLimitInfo);
    }

    if (action === "analytics") {
      const analytics = await RateLimitHelpers.getRateLimitAnalytics(days);
      return NextResponse.json(analytics);
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle rate limit request" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier");
    const endpoint = searchParams.get("endpoint");
    const method = searchParams.get("method");
    const body = await request.json();
    const success = body.success !== false;

    if (!identifier || !endpoint || !method) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    await RateLimitHelpers.updateRateLimit(
      identifier,
      endpoint,
      method,
      success,
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update rate limit" },
      { status: 500 },
    );
  }
}
