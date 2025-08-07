import { NextRequest, NextResponse } from "next/server";

import { deleteUserData, exportUserData, getConsentStatus } from "./manageGDPR";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 },
      );
    }

    if (action === "export") {
      const result = await exportUserData(userId);
      return NextResponse.json(result);
    } else if (action === "consent") {
      const result = await getConsentStatus(userId);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'export' or 'consent'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("GDPR compliance route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reason } = body;

    if (!userId || !reason) {
      return NextResponse.json(
        { error: "userId and reason are required" },
        { status: 400 },
      );
    }

    const result = await deleteUserData(userId, reason);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GDPR deletion route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
