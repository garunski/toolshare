import { NextRequest, NextResponse } from "next/server";

import { getSavedSearches, saveSearch, trackSearch } from "./analyzeSearch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    if (action === "saved" && userId) {
      const savedSearches = await getSavedSearches(userId);
      return NextResponse.json(savedSearches);
    }

    return NextResponse.json(
      { error: "Invalid action or missing user ID" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get search analytics" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, name, filters, query, resultsCount } = body;

    if (action === "save" && userId && name && filters) {
      const result = await saveSearch(userId, name, filters);
      return NextResponse.json(result);
    }

    if (action === "track" && query && resultsCount !== undefined) {
      await trackSearch(query, filters || {}, resultsCount, userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process search analytics" },
      { status: 500 },
    );
  }
}
