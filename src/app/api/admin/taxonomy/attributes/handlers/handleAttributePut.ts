import { NextResponse } from "next/server";

import { PerformAttribute } from "../performAttribute";
import { PerformAttributeOperations } from "../performAttributeOperations";

export async function handleAttributePut(body: any) {
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
    const result =
      await PerformAttributeOperations.updateAttribute(attributeData);

    return NextResponse.json(result);
  }
}
