import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api-error-handler";

import { PerformAttribute } from "../performAttribute";
import { PerformAttributeOperations } from "../performAttributeOperations";

export async function handleAttributeGet(
  categoryId: string | null,
  dataType: string | null,
  attributeId: string | null,
) {
  if (attributeId) {
    const result =
      await PerformAttributeOperations.getAttributeById(attributeId);

    if (!result) {
      throw new ApiError(404, "Attribute not found", "ATTRIBUTE_NOT_FOUND");
    }

    return NextResponse.json(result);
  }

  if (dataType) {
    const result =
      await PerformAttributeOperations.getAttributesByType(dataType);

    return NextResponse.json(result);
  }

  if (categoryId) {
    const result = await PerformAttribute.manageCategoryAttributes(categoryId);

    return NextResponse.json(result);
  }

  const result = await PerformAttributeOperations.manageAttributes();

  return NextResponse.json(result);
}
