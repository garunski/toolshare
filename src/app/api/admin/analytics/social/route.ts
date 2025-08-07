import { NextRequest, NextResponse } from "next/server";

import { SocialStatsOperations } from "./getSocialStats";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    switch (action) {
      case "stats":
        const stats = await SocialStatsOperations.getSocialStats(userId);
        return NextResponse.json(stats);

      case "user_stats":
        const userStats = await SocialStatsOperations.getUserStats(userId);
        return NextResponse.json(userStats);

      case "friends_of_friends":
        const limit = parseInt(searchParams.get("limit") || "10");
        const friendsOfFriends =
          await SocialStatsOperations.getFriendsOfFriends(userId, limit);
        return NextResponse.json(friendsOfFriends);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get social stats" },
      { status: 500 },
    );
  }
}
