import { NextResponse } from "next/server";

import { PerformAttribute } from "../performAttribute";
import { PerformAttributeOperations } from "../performAttributeOperations";

export async function handleAttributePost(body: any) {
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
    const result =
      await PerformAttributeOperations.createAttribute(attributeData);

    return NextResponse.json(result);
  }
}
