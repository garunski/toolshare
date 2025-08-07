import { findSimilarItems } from "./findSimilarItems";
import { getCategoryRequirements } from "./getCategoryRequirements";
import type { AutoPopulateResult, FieldSuggestion } from "./types";

export async function getFieldSuggestions(
  categoryId: number,
  itemContext: {
    name: string;
    description?: string;
    attributes?: Record<string, any>;
  },
): Promise<AutoPopulateResult<FieldSuggestion[]>> {
  try {
    const [categoryReqs, similarItems] = await Promise.all([
      getCategoryRequirements(categoryId),
      findSimilarItems(categoryId, itemContext),
    ]);

    const suggestions: FieldSuggestion[] = [];

    categoryReqs.requiredFields.forEach((field) => {
      suggestions.push({
        fieldName: field,
        suggestedValue: "",
        confidence: 50,
        source: "taxonomy",
        reasoning: `Required field for this category`,
      });
    });

    if (similarItems.length > 0) {
      const commonConditions = similarItems
        .map((item) => item.condition)
        .filter((value) => value && typeof value === "string");
      const commonLocations = similarItems
        .map((item) => item.location)
        .filter((value) => value && typeof value === "string");

      if (commonConditions.length > 0) {
        suggestions.push({
          fieldName: "condition",
          suggestedValue: commonConditions[0],
          confidence: 70,
          source: "similar_items",
          reasoning: `Common condition for similar items: ${commonConditions[0]}`,
        });
      }

      if (commonLocations.length > 0) {
        suggestions.push({
          fieldName: "location",
          suggestedValue: commonLocations[0],
          confidence: 65,
          source: "similar_items",
          reasoning: `Common location for similar items: ${commonLocations[0]}`,
        });
      }
    }

    suggestions.push(
      {
        fieldName: "is_available",
        suggestedValue: "true",
        confidence: 90,
        source: "defaults",
        reasoning: "New items are typically available for sharing",
      },
      {
        fieldName: "is_public",
        suggestedValue: "true",
        confidence: 85,
        source: "defaults",
        reasoning: "Public visibility helps others discover your item",
      },
    );

    const filteredSuggestions = suggestions
      .filter((s) => s.confidence > 20)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      success: true,
      data: filteredSuggestions,
    };
  } catch (error) {
    console.error("Get field suggestions error:", error);
    return {
      success: false,
      error: "Failed to get field suggestions",
    };
  }
}
