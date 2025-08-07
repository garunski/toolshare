import { NextRequest, NextResponse } from "next/server";

import { SearchEngine } from "./runSearchEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, limit = 20, offset = 0, userId } = body;

    // Execute search using the engine
    const result = await SearchEngine.executeSearch(filters, limit, offset);

    // Track search analytics if user is provided
    if (userId && filters.query) {
      await SearchEngine.trackSearchAnalytics(
        filters.query,
        filters,
        result.totalCount,
        userId,
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to execute search" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (action === "saved") {
      const savedSearches = await SearchEngine.getUserSavedSearches(userId);
      return NextResponse.json(savedSearches);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get saved searches" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, filters } = body;

    if (!userId || !name || !filters) {
      return NextResponse.json(
        { error: "User ID, name, and filters required" },
        { status: 400 },
      );
    }

    const result = await SearchEngine.saveUserSearch(userId, name, filters);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save search" },
      { status: 500 },
    );
  }
}
