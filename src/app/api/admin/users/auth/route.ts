import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentAuthState,
  handleAuthEvent,
  listenAuthState,
} from "./listenAuth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "listen") {
      const result = await listenAuthState();
      return NextResponse.json(result);
    } else if (action === "current") {
      const result = await getCurrentAuthState();
      return NextResponse.json(result);
    } else {
      // Default: get current auth state
      const result = await getCurrentAuthState();
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Auth route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, session } = body;

    if (event && session) {
      const result = await handleAuthEvent(event, session);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "event and session are required" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Auth event route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
