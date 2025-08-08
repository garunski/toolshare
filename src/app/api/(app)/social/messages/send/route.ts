import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { PerformMessage } from "./performMessage";

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      throw new ApiError(
        400,
        "Missing required parameter: otherUserId",
        "MISSING_OTHER_USER_ID",
      );
    }

    const result = await PerformMessage.getMessages(userId, otherUserId);

    if (!result.success) {
      throw new ApiError(
        500,
        "Failed to fetch messages",
        "MESSAGES_FETCH_FAILED",
      );
    }

    return NextResponse.json({ data: result.data });
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

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      throw new ApiError(
        400,
        "Missing required parameters: receiverId and content",
        "MISSING_REQUIRED_PARAMS",
      );
    }

    const result = await PerformMessage.sendMessage(
      userId,
      receiverId,
      content,
    );

    if (!result.success) {
      throw new ApiError(500, "Failed to send message", "MESSAGE_SEND_FAILED");
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      throw new ApiError(
        400,
        "Missing required parameter: messageId",
        "MISSING_MESSAGE_ID",
      );
    }

    await PerformMessage.deleteMessage(messageId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
