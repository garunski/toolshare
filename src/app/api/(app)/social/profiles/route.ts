import { NextRequest, NextResponse } from "next/server";

import { PerformProfileOperation } from "./performProfileOperation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "profile":
        result = await PerformProfileOperation.getProfile(userId);
        break;
      case "search":
        const query = searchParams.get("query");
        const limit = searchParams.get("limit");
        if (!query) {
          return NextResponse.json(
            { error: "Missing required parameter: query" },
            { status: 400 },
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
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 },
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process profile",
      },
      { status: 500 },
    );
  }
}
