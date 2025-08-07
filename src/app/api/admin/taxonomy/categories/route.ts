import { NextRequest, NextResponse } from "next/server";

import { PerformCategory } from "./performCategory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");
    const withAttributes = searchParams.get("withAttributes");

    if (categoryId) {
      if (withAttributes === "true") {
        const category =
          await PerformCategory.getCategoryWithAttributes(categoryId);
        return NextResponse.json(category);
      } else {
        const path = await PerformCategory.getCategoryPath(categoryId);
        return NextResponse.json({ path });
      }
    }

    const categories = await PerformCategory.getAllCategoriesTree();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await PerformCategory.createCategory(body);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await PerformCategory.updateCategory(body);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    await PerformCategory.deleteCategory(categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
