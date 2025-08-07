import { NextRequest, NextResponse } from "next/server";

import { getSmartDefaults } from "./getSmartDefaults";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryReqs, itemContext } = body;

    if (!itemContext?.name) {
      return NextResponse.json(
        { error: "itemContext.name is required" },
        { status: 400 },
      );
    }

    const result = await getSmartDefaults(categoryReqs || {}, itemContext);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Smart defaults route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
