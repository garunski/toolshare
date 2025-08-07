import { NextRequest, NextResponse } from "next/server";

import { GetCategorySuggestions } from "./getCategorySuggestions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryReqs, itemContext } = body;

    if (!categoryReqs || !itemContext) {
      return NextResponse.json(
        { error: "Category requirements and item context are required" },
        { status: 400 },
      );
    }

    const suggestions = GetCategorySuggestions.suggestCategories(
      categoryReqs,
      itemContext,
    );
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error generating category suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate category suggestions" },
      { status: 500 },
    );
  }
}
