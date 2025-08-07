interface AttributeMapping {
  externalAttribute: string;
  internalField: string;
  mappingType: "direct" | "transform" | "composite";
  transformation?: (value: any) => any;
  validation?: (value: any) => boolean;
  isRequired: boolean;
  defaultValue?: any;
}

export class AttributeMappingHelper {
  /**
   * Apply mapping transformation
   */
  static applyMapping(mapping: AttributeMapping, value: any): any {
    if (value === undefined || value === null) {
      return mapping.defaultValue;
    }

    if (mapping.transformation) {
      return mapping.transformation(value);
    }

    return value;
  }

  /**
   * Normalize condition values
   */
  static normalizeCondition(value: string): string {
    const normalized = value.toLowerCase().trim();

    if (normalized.includes("new") || normalized.includes("unused")) {
      return "new";
    }
    if (normalized.includes("excellent") || normalized.includes("perfect")) {
      return "excellent";
    }
    if (normalized.includes("good") || normalized.includes("working")) {
      return "good";
    }
    if (normalized.includes("fair") || normalized.includes("used")) {
      return "fair";
    }
    if (normalized.includes("poor") || normalized.includes("broken")) {
      return "poor";
    }

    return "good"; // Default fallback
  }

  /**
   * Get mapping suggestions for external data
   */
  static getSuggestions(
    categoryMappings: Record<string, AttributeMapping>,
    externalData: Record<string, any>,
  ): Record<string, string> {
    const suggestions: Record<string, string> = {};

    // Suggest mappings for unmapped external fields
    Object.keys(externalData).forEach((externalField) => {
      const mappedField = Object.values(categoryMappings).find(
        (mapping) => mapping.externalAttribute === externalField,
      );

      if (!mappedField) {
        // Try to find a similar internal field
        const similarField = this.findSimilarField(
          externalField,
          categoryMappings,
        );
        if (similarField) {
          suggestions[externalField] = similarField;
        }
      }
    });

    return suggestions;
  }

  /**
   * Find similar field names for mapping suggestions
   */
  private static findSimilarField(
    externalField: string,
    mappings: Record<string, AttributeMapping>,
  ): string | null {
    const externalLower = externalField.toLowerCase();
    const internalFields = Object.keys(mappings);

    // Look for exact matches or similar patterns
    for (const internalField of internalFields) {
      const internalLower = internalField.toLowerCase();

      if (
        externalLower.includes(internalLower) ||
        internalLower.includes(externalLower)
      ) {
        return internalField;
      }
    }

    return null;
  }
}
