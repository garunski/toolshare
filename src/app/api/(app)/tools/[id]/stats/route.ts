import { NextRequest, NextResponse } from "next/server";

import { getItemStats } from "./getItemStats";

export async function GET(request: NextRequest) {
  try {
    const result = await getItemStats();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Get item stats route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
