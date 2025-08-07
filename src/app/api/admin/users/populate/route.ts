import { NextRequest, NextResponse } from "next/server";

import { getFieldSuggestions } from "./autoPopulate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, itemContext } = body;

    if (!categoryId || !itemContext?.name) {
      return NextResponse.json(
        { error: "categoryId and itemContext.name are required" },
        { status: 400 },
      );
    }

    const result = await getFieldSuggestions(categoryId, itemContext);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Auto populate route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
