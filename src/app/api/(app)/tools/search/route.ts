import { NextRequest, NextResponse } from "next/server";

import { performItemSearch } from "./performItemSearch";
import { performToolSearch } from "./performToolSearch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);
    const searchType = searchParams.get("type") || "tools";

    if (searchType === "items") {
      const results = await performItemSearch(filters);
      return NextResponse.json(results);
    } else {
      const results = await performToolSearch(filters);
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error("Tool search route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchType = body.type || "tools";

    if (searchType === "items") {
      const results = await performItemSearch(body);
      return NextResponse.json(results);
    } else {
      const results = await performToolSearch(body);
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error("Tool search route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
