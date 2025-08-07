import { NextRequest, NextResponse } from "next/server";

import {
  detectSuspiciousActivity,
  getSecurityHeaders,
  logSecurityEvent,
  sanitizeInput,
} from "./manageSecurity";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "headers") {
      const headers = getSecurityHeaders();
      return NextResponse.json({ headers });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'headers'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Security route error:", error);
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

    if (action === "detect") {
      const { userId, action: userAction, context } = body;

      if (!userId || !userAction) {
        return NextResponse.json(
          { error: "userId and action are required" },
          { status: 400 },
        );
      }

      const result = await detectSuspiciousActivity(
        userId,
        userAction,
        context || {},
      );
      return NextResponse.json(result);
    } else if (action === "log") {
      const { event } = body;

      if (!event) {
        return NextResponse.json(
          { error: "event is required" },
          { status: 400 },
        );
      }

      const result = await logSecurityEvent(event);
      return NextResponse.json(result);
    } else if (action === "sanitize") {
      const { input } = body;

      if (!input) {
        return NextResponse.json(
          { error: "input is required" },
          { status: 400 },
        );
      }

      const sanitized = sanitizeInput(input);
      return NextResponse.json({ sanitized });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'detect', 'log', or 'sanitize'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Security management route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
