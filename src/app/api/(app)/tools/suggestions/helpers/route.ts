import { NextRequest, NextResponse } from "next/server";

import { SimilarItemsHelper } from "./similarItemsHelper";

export async function POST(request: NextRequest) {
  try {
    const { categoryId, itemContext } = await request.json();

    if (!categoryId || !itemContext?.name) {
      return NextResponse.json(
        { error: "Missing required fields: categoryId and itemContext.name" },
        { status: 400 },
      );
    }

    const similarItems = await SimilarItemsHelper.findSimilarItemsWithScore(
      categoryId,
      itemContext,
    );

    return NextResponse.json({ success: true, similarItems });
  } catch (error) {
    console.error("Error finding similar items:", error);
    return NextResponse.json(
      { error: "Failed to find similar items" },
      { status: 500 },
    );
  }
}
