import { NextRequest, NextResponse } from "next/server";

import { PerformAttribute } from "./performAttribute";
import { PerformAttributeOperations } from "./performAttributeOperations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const dataType = searchParams.get("dataType");
    const attributeId = searchParams.get("attributeId");

    if (attributeId) {
      const attribute =
        await PerformAttributeOperations.getAttributeById(attributeId);
      return NextResponse.json(attribute);
    }

    if (dataType) {
      const attributes =
        await PerformAttributeOperations.getAttributesByType(dataType);
      return NextResponse.json(attributes);
    }

    if (categoryId) {
      const attributes =
        await PerformAttribute.manageCategoryAttributes(categoryId);
      return NextResponse.json(attributes);
    }

    const attributes = await PerformAttributeOperations.manageAttributes();
    return NextResponse.json(attributes);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
      attributeId,
      isRequired,
      displayOrder,
      ...attributeData
    } = body;

    if (categoryId && attributeId) {
      // Assign attribute to category
      await PerformAttribute.assignAttributeToCategory(
        categoryId,
        attributeId,
        isRequired,
        displayOrder,
      );
      return NextResponse.json({ success: true });
    } else {
      // Create new attribute
      const attribute =
        await PerformAttributeOperations.createAttribute(attributeData);
      return NextResponse.json(attribute);
    }
  } catch (error) {
    console.error("Error creating/assigning attribute:", error);
    return NextResponse.json(
      { error: "Failed to create/assign attribute" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, attributeId, updates, ...attributeData } = body;

    if (categoryId && attributeId && updates) {
      // Update category attribute
      await PerformAttribute.updateCategoryAttribute(
        categoryId,
        attributeId,
        updates,
      );
      return NextResponse.json({ success: true });
    } else {
      // Update attribute definition
      const attribute =
        await PerformAttributeOperations.updateAttribute(attributeData);
      return NextResponse.json(attribute);
    }
  } catch (error) {
    console.error("Error updating attribute:", error);
    return NextResponse.json(
      { error: "Failed to update attribute" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const attributeId = searchParams.get("attributeId");

    if (!attributeId) {
      return NextResponse.json(
        { error: "Attribute ID is required" },
        { status: 400 },
      );
    }

    if (categoryId) {
      // Remove attribute from category
      await PerformAttribute.removeAttributeFromCategory(
        categoryId,
        attributeId,
      );
    } else {
      // Delete attribute definition
      await PerformAttributeOperations.deleteAttribute(attributeId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return NextResponse.json(
      { error: "Failed to delete attribute" },
      { status: 500 },
    );
  }
}
