import { NextRequest, NextResponse } from "next/server";

import { ValidateAttributes } from "./validateAttributes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryAttributes, mappedData } = body;

    if (!categoryAttributes || !mappedData) {
      return NextResponse.json(
        { error: "Category attributes and mapped data are required" },
        { status: 400 },
      );
    }

    const validationResult = ValidateAttributes.validateData(
      categoryAttributes,
      mappedData,
    );
    return NextResponse.json(validationResult);
  } catch (error) {
    console.error("Error validating attributes:", error);
    return NextResponse.json(
      { error: "Failed to validate attributes" },
      { status: 500 },
    );
  }
}
