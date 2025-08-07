import { NextRequest, NextResponse } from "next/server";

import { GetFriendRequests } from "./getFriendRequests";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const field = searchParams.get("field") as "sender_id" | "receiver_id";

    if (!userId || !field) {
      return NextResponse.json(
        { error: "Missing required parameters: userId and field" },
        { status: 400 },
      );
    }

    const { data, error } = await GetFriendRequests.fetchRequests(
      userId,
      field,
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch requests",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, validatedData } = body;

    if (!senderId || !validatedData) {
      return NextResponse.json(
        { error: "Missing required parameters: senderId and validatedData" },
        { status: 400 },
      );
    }

    const data = await GetFriendRequests.createRequest(senderId, validatedData);

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create request",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const userId = searchParams.get("userId");

    if (!requestId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters: requestId and userId" },
        { status: 400 },
      );
    }

    const { error } = await GetFriendRequests.cancelRequest(requestId, userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to cancel request",
      },
      { status: 500 },
    );
  }
}
