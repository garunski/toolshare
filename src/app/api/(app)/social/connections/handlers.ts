import { NextResponse } from "next/server";

import { ProcessConnections } from "./processConnections";

export async function handleGetRequest(searchParams: URLSearchParams) {
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
    case "friends":
      result = await ProcessConnections.getFriends(userId);
      break;
    case "stats":
      result = await ProcessConnections.getSocialStats(userId);
      break;
    case "suggested":
      const limit = searchParams.get("limit");
      result = await ProcessConnections.getSuggestedFriends(
        userId,
        limit ? parseInt(limit) : 5,
      );
      break;
    case "friendsOfFriends":
      const friendsLimit = searchParams.get("limit");
      result = await ProcessConnections.getFriendsOfFriends(
        userId,
        friendsLimit ? parseInt(friendsLimit) : 10,
      );
      break;
    case "search":
      const query = searchParams.get("query");
      const searchLimit = searchParams.get("limit");
      if (!query) {
        return NextResponse.json(
          { error: "Missing required parameter: query" },
          { status: 400 },
        );
      }
      result = await ProcessConnections.searchUsers(
        query,
        userId,
        searchLimit ? parseInt(searchLimit) : 10,
      );
      break;
    case "friendshipStatus":
      const otherUserId = searchParams.get("otherUserId");
      if (!otherUserId) {
        return NextResponse.json(
          { error: "Missing required parameter: otherUserId" },
          { status: 400 },
        );
      }
      result = await ProcessConnections.checkFriendshipStatus(
        userId,
        otherUserId,
      );
      break;
    case "profile":
      const profileUserId = searchParams.get("profileUserId") || userId;
      result = await ProcessConnections.getProfile(profileUserId);
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
}

export async function handlePostRequest(body: any) {
  const { action, userId, friendId, senderId, receiverId } = body;

  if (!action || !userId) {
    return NextResponse.json(
      { error: "Missing required parameters: action and userId" },
      { status: 400 },
    );
  }

  let result;

  switch (action) {
    case "removeFriend":
      if (!friendId) {
        return NextResponse.json(
          { error: "Missing required parameter: friendId" },
          { status: 400 },
        );
      }
      result = await ProcessConnections.removeFriend(userId, friendId);
      break;
    case "sendFriendRequest":
      if (!senderId || !receiverId) {
        return NextResponse.json(
          { error: "Missing required parameters: senderId and receiverId" },
          { status: 400 },
        );
      }
      result = await ProcessConnections.sendFriendRequest(senderId, receiverId);
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

  return NextResponse.json({ success: true });
}
