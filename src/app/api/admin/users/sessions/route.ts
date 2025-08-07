import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentSession,
  handleSessionRefresh,
  handleSessionSignOut,
} from "./handleSession";
import {
  checkSessionNeedsRefresh,
  clearInvalidSession,
  getSessionExpiry,
  validateSession,
} from "./validateSession";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "validate") {
      const result = await validateSession();
      return NextResponse.json(result);
    } else if (action === "needsRefresh") {
      const result = await checkSessionNeedsRefresh();
      return NextResponse.json(result);
    } else if (action === "expiry") {
      const result = await getSessionExpiry();
      return NextResponse.json(result);
    } else {
      // Default: get current session
      const result = await getCurrentSession();

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error("Get session route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "refresh") {
      const result = await handleSessionRefresh();

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    } else if (action === "signout") {
      const result = await handleSessionSignOut();

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } else if (action === "clear") {
      const result = await clearInvalidSession();

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'refresh', 'signout', or 'clear'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Session management route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
