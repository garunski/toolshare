import { NextRequest, NextResponse } from "next/server";

import { ScoreCategories } from "./scoreCategories";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidates, context } = body;

    if (!candidates || !context) {
      return NextResponse.json(
        { error: "Missing required fields: candidates and context" },
        { status: 400 },
      );
    }

    const scoredCategories = ScoreCategories.calculateCategoryScore(
      candidates,
      context,
    );
    return NextResponse.json(scoredCategories);
  } catch (error) {
    console.error("Error scoring categories:", error);
    return NextResponse.json(
      { error: "Failed to score categories" },
      { status: 500 },
    );
  }
}
