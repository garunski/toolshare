import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { PerformProfileOperation } from "./performProfileOperation";

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let result;

    switch (action) {
      case "profile":
        result = await PerformProfileOperation.getProfile(userId);
        break;
      case "search":
        const query = searchParams.get("query");
        const limit = searchParams.get("limit");
        if (!query) {
          throw new ApiError(
            400,
            "Missing required parameter: query",
            "MISSING_QUERY",
          );
        }
        result = await PerformProfileOperation.searchUsers(
          query,
          userId,
          limit ? parseInt(limit) : 10,
        );
        break;
      case "suggested":
        const suggestedLimit = searchParams.get("limit");
        result = await PerformProfileOperation.getSuggestedFriends(
          userId,
          suggestedLimit ? parseInt(suggestedLimit) : 5,
        );
        break;
      default:
        throw new ApiError(400, "Invalid action parameter", "INVALID_ACTION");
    }

    if (!result.success) {
      throw new ApiError(
        500,
        "Failed to process request",
        "PROFILE_OPERATION_FAILED",
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return handleApiError(error);
  }
}
