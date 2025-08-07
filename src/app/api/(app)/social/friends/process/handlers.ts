import { NextResponse } from "next/server";

import { ProcessFriendRequest } from "./processFriendRequest";

export async function handleGetRequest(searchParams: URLSearchParams) {
  const userId = searchParams.get("userId");
  const type = searchParams.get("type");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required parameter: userId" },
      { status: 400 },
    );
  }

  let result;

  switch (type) {
    case "pending":
      result = await ProcessFriendRequest.getPendingRequests(userId);
      break;
    case "sent":
      result = await ProcessFriendRequest.getSentRequests(userId);
      break;
    default:
      return NextResponse.json(
        { error: "Invalid type parameter. Use 'pending' or 'sent'" },
        { status: 400 },
      );
  }

  if (!result.success) {
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function handlePostRequest(body: any) {
  const { action, requestId, userId, formData, senderId } = body;

  if (!action) {
    return NextResponse.json(
      { error: "Missing required parameter: action" },
      { status: 400 },
    );
  }

  let result;

  switch (action) {
    case "send":
      if (!formData || !senderId) {
        return NextResponse.json(
          { error: "Missing required parameters: formData and senderId" },
          { status: 400 },
        );
      }
      result = await ProcessFriendRequest.sendFriendRequest(formData, senderId);
      break;
    case "respond":
      if (!requestId || !userId) {
        return NextResponse.json(
          { error: "Missing required parameters: requestId and userId" },
          { status: 400 },
        );
      }
      const responseAction = body.responseAction;
      if (!responseAction || !["accept", "reject"].includes(responseAction)) {
        return NextResponse.json(
          { error: "Missing or invalid responseAction parameter" },
          { status: 400 },
        );
      }
      result = await ProcessFriendRequest.respondToFriendRequest(
        requestId,
        responseAction,
        userId,
      );
      break;
    case "cancel":
      if (!requestId || !userId) {
        return NextResponse.json(
          { error: "Missing required parameters: requestId and userId" },
          { status: 400 },
        );
      }
      result = await ProcessFriendRequest.cancelFriendRequest(
        requestId,
        userId,
      );
      break;
    case "process":
      if (!requestId) {
        return NextResponse.json(
          { error: "Missing required parameter: requestId" },
          { status: 400 },
        );
      }
      const processAction = body.processAction;
      if (!processAction || !["accept", "reject"].includes(processAction)) {
        return NextResponse.json(
          { error: "Missing or invalid processAction parameter" },
          { status: 400 },
        );
      }
      result = await ProcessFriendRequest.processRequest(
        requestId,
        processAction,
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
      { error: "Failed to process friend request" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: "data" in result ? result.data : null,
  });
}
