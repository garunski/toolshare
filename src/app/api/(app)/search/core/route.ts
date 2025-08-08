import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { buildSearchQuery, getSearchFacets } from "./performAdvancedSearch";

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

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

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new ApiError(400, "Invalid limit parameter", "INVALID_LIMIT");
    }
    if (offset < 0) {
      throw new ApiError(400, "Invalid offset parameter", "INVALID_OFFSET");
    }

    // Build and execute search query
    const query = buildSearchQuery(filters, limit, offset);
    const { data: items, error, count } = await query;

    if (error) {
      throw new ApiError(500, "Search query failed", "SEARCH_QUERY_FAILED");
    }

    return NextResponse.json({
      items,
      count,
      filters,
      pagination: { limit, offset },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "facets") {
      const facets = await getSearchFacets();
      return NextResponse.json(facets);
    }

    throw new ApiError(400, "Invalid action", "INVALID_ACTION");
  } catch (error) {
    return handleApiError(error);
  }
}
