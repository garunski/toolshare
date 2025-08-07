import { NextRequest, NextResponse } from "next/server";

import { PerformMessage } from "./performMessage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const otherUserId = searchParams.get("otherUserId");

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: "Missing required parameters: userId and otherUserId" },
        { status: 400 },
      );
    }

    const result = await PerformMessage.getMessages(userId, otherUserId);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get messages",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: senderId, receiverId, and content",
        },
        { status: 400 },
      );
    }

    const result = await PerformMessage.sendMessage(
      senderId,
      receiverId,
      content,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    const userId = searchParams.get("userId");

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters: messageId and userId" },
        { status: 400 },
      );
    }

    await PerformMessage.deleteMessage(messageId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete message",
      },
      { status: 500 },
    );
  }
}
