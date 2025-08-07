import { NextRequest, NextResponse } from "next/server";

import { generateSuggestions, getSimilarItems } from "./getSimilarItems";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemName = searchParams.get("itemName");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!itemName) {
      return NextResponse.json(
        { error: "itemName parameter is required" },
        { status: 400 },
      );
    }

    const result = await getSimilarItems(itemName, limit);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Similar items route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemName, itemContext } = body;

    if (!itemName) {
      return NextResponse.json(
        { error: "itemName is required" },
        { status: 400 },
      );
    }

    const result = await getSimilarItems(itemName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const suggestions = generateSuggestions(
      result.data || [],
      itemContext || { name: itemName },
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Generate suggestions route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
