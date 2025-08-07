interface FieldSuggestion {
  fieldName: string;
  suggestedValue: string;
  confidence: number;
  source: "taxonomy" | "similar_items" | "defaults";
  reasoning: string;
}

interface CategoryRequirements {
  requiredFields: string[];
  optionalFields: string[];
  fieldTypes: Record<string, string>;
  validationRules: Record<string, any>;
}

export class GetCategorySuggestions {
  /**
   * Generate category-based field suggestions
   */
  static suggestCategories(
    categoryReqs: CategoryRequirements,
    itemContext: { name: string; description?: string },
  ): FieldSuggestion[] {
    const suggestions: FieldSuggestion[] = [];

    // Suggest condition based on item context
    const conditionSuggestion = this.suggestCondition(itemContext);
    if (conditionSuggestion) {
      suggestions.push(conditionSuggestion);
    }

    // Suggest location if not provided
    if (!itemContext.description?.toLowerCase().includes("location")) {
      suggestions.push({
        fieldName: "location",
        suggestedValue: "Local pickup available",
        confidence: 60,
        source: "defaults",
        reasoning: "Common location pattern for shared items",
      });
    }

    return suggestions;
  }

  /**
   * Suggest condition based on item context
   */
  private static suggestCondition(itemContext: {
    name: string;
    description?: string;
  }): FieldSuggestion | null {
    const text =
      `${itemContext.name} ${itemContext.description || ""}`.toLowerCase();

    if (text.includes("new") || text.includes("unused")) {
      return {
        fieldName: "condition",
        suggestedValue: "new",
        confidence: 85,
        source: "taxonomy",
        reasoning: "Item description indicates new condition",
      };
    }

    if (text.includes("excellent") || text.includes("perfect")) {
      return {
        fieldName: "condition",
        suggestedValue: "excellent",
        confidence: 80,
        source: "taxonomy",
        reasoning: "Item description indicates excellent condition",
      };
    }

    if (text.includes("good") || text.includes("working")) {
      return {
        fieldName: "condition",
        suggestedValue: "good",
        confidence: 75,
        source: "taxonomy",
        reasoning: "Item description indicates good condition",
      };
    }

    return null;
  }
}
