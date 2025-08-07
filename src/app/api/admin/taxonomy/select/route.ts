import { NextRequest, NextResponse } from "next/server";

import { PerformCategorySelect } from "./performCategorySelect";

export async function GET(request: NextRequest) {
  try {
    const categories = await PerformCategorySelect.selectCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories for select:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
