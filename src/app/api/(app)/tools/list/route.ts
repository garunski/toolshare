import { NextRequest, NextResponse } from "next/server";

import { getTools } from "./getTools";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);
    const tools = await getTools(filters);

    if (!tools.success) {
      return NextResponse.json({ error: tools.error }, { status: 400 });
    }

    return NextResponse.json(tools.data);
  } catch (error) {
    console.error("Tool list route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
