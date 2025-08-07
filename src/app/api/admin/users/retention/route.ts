import { NextRequest, NextResponse } from "next/server";

import {
  executeRetentionPolicies,
  scheduleRetentionCleanup,
} from "./manageDataRetention";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "execute") {
      const result = await executeRetentionPolicies();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'execute'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Data retention route error:", error);
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

    if (action === "schedule") {
      const result = await scheduleRetentionCleanup();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'schedule'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Data retention schedule route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
