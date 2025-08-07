import { NextRequest, NextResponse } from "next/server";

import { performTool } from "./performTool";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await performTool(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Tool creation route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
