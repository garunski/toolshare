import { NextRequest, NextResponse } from "next/server";

import { getItemsByCategory, getToolCategories } from "./getToolCategories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (categoryId) {
      // Get items by specific category
      const result = await getItemsByCategory(categoryId, limit);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    } else {
      // Get all tool categories
      const result = await getToolCategories();

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error("Tool categories route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
