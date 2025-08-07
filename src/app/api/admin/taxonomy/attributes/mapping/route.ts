import { NextRequest, NextResponse } from "next/server";

import { ManageAttributeMapping } from "./manageAttributeMapping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, externalData, action } = body;

    if (!categoryId || !externalData) {
      return NextResponse.json(
        { error: "Category ID and external data are required" },
        { status: 400 },
      );
    }

    if (action === "map") {
      const mappedData = await ManageAttributeMapping.mapAttributes(
        categoryId,
        externalData,
      );
      return NextResponse.json(mappedData);
    } else if (action === "validate") {
      const validationResult = await ManageAttributeMapping.validateMappedData(
        categoryId,
        externalData,
      );
      return NextResponse.json(validationResult);
    } else if (action === "suggestions") {
      const suggestions = await ManageAttributeMapping.getMappingSuggestions(
        categoryId,
        externalData,
      );
      return NextResponse.json(suggestions);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'map', 'validate', or 'suggestions'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error managing attribute mapping:", error);
    return NextResponse.json(
      { error: "Failed to manage attribute mapping" },
      { status: 500 },
    );
  }
}
