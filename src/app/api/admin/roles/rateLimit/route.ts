import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";

import { ApiRateLimiterOperations } from "./rateLimiter";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "default";

    const rateLimitInfo = await ApiRateLimiterOperations.getRateLimitInfo(
      user.id,
      action,
    );

    return NextResponse.json({
      success: true,
      data: rateLimitInfo,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to get rate limit info" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, endpoint, method, statusCode } = body;

    if (!action || !endpoint || !method || !statusCode) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: action, endpoint, method, statusCode",
        },
        { status: 400 },
      );
    }

    await ApiRateLimiterOperations.recordRequest(
      user.id,
      action,
      endpoint,
      method,
      statusCode,
    );

    return NextResponse.json({
      success: true,
      message: "Request recorded successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to record request" },
      { status: 500 },
    );
  }
}
