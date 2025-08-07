import { NextRequest, NextResponse } from "next/server";

import { SuggestCategories } from "./suggestCategories";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context, action } = body;

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 },
      );
    }

    if (action === "autoCategorize") {
      const result = await SuggestCategories.autoCategorize(context);
      return NextResponse.json(result);
    } else {
      const suggestions = await SuggestCategories.runSuggestionEngine(context);
      return NextResponse.json(suggestions);
    }
  } catch (error) {
    console.error("Error running suggestion engine:", error);
    return NextResponse.json(
      { error: "Failed to run suggestion engine" },
      { status: 500 },
    );
  }
}
