import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api-error-handler";

import { PerformAttribute } from "../performAttribute";
import { PerformAttributeOperations } from "../performAttributeOperations";

export async function handleAttributeDelete(
  categoryId: string | null,
  attributeId: string | null,
) {
  if (!attributeId) {
    throw new ApiError(400, "Attribute ID is required", "MISSING_ATTRIBUTE_ID");
  }

  if (categoryId) {
    // Remove attribute from category
    await PerformAttribute.removeAttributeFromCategory(categoryId, attributeId);
  } else {
    // Delete attribute definition
    await PerformAttributeOperations.deleteAttribute(attributeId);
  }

  return NextResponse.json({ success: true });
}
