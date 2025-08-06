interface FieldSuggestion {
  fieldName: string;
  suggestedValue: string;
  confidence: number;
  source: "taxonomy" | "similar_items" | "defaults";
  reasoning: string;
}

export class SimilarItemSuggestions {
  /**
   * Generate suggestions from similar items
   */
  static generate(
    similarItems: any[],
    itemContext: { name: string },
  ): FieldSuggestion[] {
    const suggestions: FieldSuggestion[] = [];

    if (similarItems.length === 0) return suggestions;

    // Analyze common patterns in similar items
    const commonConditions = this.getCommonValues(similarItems, "condition");
    const commonLocations = this.getCommonValues(similarItems, "location");

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

    return suggestions;
  }

  /**
   * Get common values from similar items
   */
  private static getCommonValues(items: any[], field: string): string[] {
    const values = items
      .map((item) => item[field])
      .filter((value) => value && typeof value === "string");

    const valueCounts = values.reduce(
      (acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(valueCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([value]) => value);
  }
}
