import { NextRequest, NextResponse } from "next/server";

import { getSearchSuggestions } from "./searchHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter required" },
        { status: 400 },
      );
    }

    const suggestions = await getSearchSuggestions(query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get search suggestions" },
      { status: 500 },
    );
  }
}
