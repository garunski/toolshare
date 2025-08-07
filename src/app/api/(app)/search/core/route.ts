import { NextRequest, NextResponse } from "next/server";

import { buildSearchQuery, getSearchFacets } from "./performAdvancedSearch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search filters from query parameters
    const filters = {
      query: searchParams.get("query") || undefined,
      categories: searchParams
        .get("categories")
        ?.split(",")
        .map(Number)
        .filter(Boolean),
      location: searchParams.get("location") || undefined,
      condition: searchParams.get("condition")?.split(",").filter(Boolean),
      availability:
        searchParams.get("availability") === "true"
          ? true
          : searchParams.get("availability") === "false"
            ? false
            : undefined,
      owner: searchParams.get("owner") || undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      sortBy: (searchParams.get("sortBy") as any) || "relevance",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build and execute search query
    const query = buildSearchQuery(filters, limit, offset);
    const { data: items, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items,
      count,
      filters,
      pagination: { limit, offset },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "facets") {
      const facets = await getSearchFacets();
      return NextResponse.json(facets);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get search facets" },
      { status: 500 },
    );
  }
}
