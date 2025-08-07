import { NextRequest, NextResponse } from "next/server";

import {
  getItemsByOwner,
  getItemsByOwnerWithFilters,
  updateItemOwner,
} from "./performOwnerUpdate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Check if filters are provided
    const categoryId = searchParams.get("categoryId");
    const condition = searchParams.get("condition")?.split(",");
    const isAvailable = searchParams.get("isAvailable");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (categoryId || condition || isAvailable !== null) {
      // Use filtered version
      const filters = {
        categoryId: categoryId || undefined,
        condition: condition || undefined,
        isAvailable: isAvailable !== null ? isAvailable === "true" : undefined,
        limit,
        offset,
      };

      const result = await getItemsByOwnerWithFilters(id, filters);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    } else {
      // Use simple version
      const result = await getItemsByOwner(id);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error("Get owner items route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json(
        { error: "newOwnerId is required" },
        { status: 400 },
      );
    }

    const result = await updateItemOwner(id, newOwnerId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Update owner route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
