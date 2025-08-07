import { NextRequest, NextResponse } from "next/server";

import { PerformFriendRequest } from "./performFriendRequest";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const otherUserId = searchParams.get("otherUserId");
    const query = searchParams.get("query");
    const limit = searchParams.get("limit");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "friends":
        result = await PerformFriendRequest.getFriends(userId);
        break;
      case "search":
        if (!query) {
          return NextResponse.json(
            { error: "Missing required parameter: query" },
            { status: 400 },
          );
        }
        result = await PerformFriendRequest.searchUsers(
          query,
          userId,
          limit ? parseInt(limit) : 10,
        );
        break;
      case "suggested":
        result = await PerformFriendRequest.getSuggestedFriends(
          userId,
          limit ? parseInt(limit) : 5,
        );
        break;
      case "status":
        if (!otherUserId) {
          return NextResponse.json(
            { error: "Missing required parameter: otherUserId" },
            { status: 400 },
          );
        }
        result = await PerformFriendRequest.checkFriendshipStatus(
          userId,
          otherUserId,
        );
        break;
      case "profile":
        result = await PerformFriendRequest.getProfile(userId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 },
        );
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform friend request",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, friendId, senderId, receiverId } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required parameter: action" },
        { status: 400 },
      );
    }

    switch (action) {
      case "remove":
        if (!userId || !friendId) {
          return NextResponse.json(
            { error: "Missing required parameters: userId and friendId" },
            { status: 400 },
          );
        }
        await PerformFriendRequest.removeFriend(userId, friendId);
        break;
      case "send":
        if (!senderId || !receiverId) {
          return NextResponse.json(
            { error: "Missing required parameters: senderId and receiverId" },
            { status: 400 },
          );
        }
        await PerformFriendRequest.sendFriendRequest(senderId, receiverId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 },
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform friend request",
      },
      { status: 500 },
    );
  }
}
