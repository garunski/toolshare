import { NextRequest, NextResponse } from "next/server";

import { handleGetRequest, handlePostRequest } from "./handlers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    return await handleGetRequest(searchParams);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process friend requests",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await handlePostRequest(body);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process friend request",
      },
      { status: 500 },
    );
  }
}
