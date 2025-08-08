interface AttributeMapping {
  externalAttribute: string;
  internalField: string;
  mappingType: "direct" | "transform" | "composite";
  transformation?: (value: any) => any;
  validation?: (value: any) => boolean;
  isRequired: boolean;
  defaultValue?: any;
}

/**
 * Helper class for mapping suggestions
 */
export class AttributeMappingHelper {
  /**
   * Get mapping suggestions for external data
   */
  static getSuggestions(
    categoryMappings: Record<string, AttributeMapping>,
    externalData: Record<string, any>,
  ): Record<string, string> {
    const suggestions: Record<string, string> = {};

    // Find unmapped external fields
    const mappedExternalFields = new Set(
      Object.values(categoryMappings).map(
        (mapping) => mapping.externalAttribute,
      ),
    );

    Object.keys(externalData).forEach((externalField) => {
      if (!mappedExternalFields.has(externalField)) {
        // Suggest mapping to a field with similar name
        const suggestedField = this.findSimilarField(externalField);
        if (suggestedField) {
          suggestions[externalField] = suggestedField;
        }
      }
    });

    return suggestions;
  }

  /**
   * Find a similar field name for mapping suggestion
   */
  private static findSimilarField(externalField: string): string | null {
    const normalizedField = externalField
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Common field name mappings
    const fieldMappings: Record<string, string> = {
      name: "name",
      title: "name",
      description: "description",
      desc: "description",
      category: "category",
      cat: "category",
      type: "type",
      condition: "condition",
      status: "status",
      location: "location",
      address: "location",
      price: "price",
      cost: "price",
      value: "price",
      image: "image",
      img: "image",
      photo: "image",
      picture: "image",
    };

    return fieldMappings[normalizedField] || null;
  }
}
