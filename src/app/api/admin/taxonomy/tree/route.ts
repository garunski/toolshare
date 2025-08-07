import { NextRequest, NextResponse } from "next/server";

import { BuildCategoryTree } from "./buildCategoryTree";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "Categories array is required" },
        { status: 400 },
      );
    }

    const categoryTree = BuildCategoryTree.getCategoryHierarchy(categories);
    return NextResponse.json(categoryTree);
  } catch (error) {
    console.error("Error building category tree:", error);
    return NextResponse.json(
      { error: "Failed to build category tree" },
      { status: 500 },
    );
  }
}
