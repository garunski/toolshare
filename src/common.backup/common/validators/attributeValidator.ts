import { createClient } from "@/common/supabase/client";

import {
  attributeCreationSchema,
  attributeUpdateSchema,
} from "./attributeSchemas";
import { AttributeValidationHelpers } from "./attributeValidationHelpers";

// Export schemas for use in other files
export { attributeCreationSchema, attributeUpdateSchema };

// Validation helper functions
export class AttributeValidator {
  // Validate attribute creation data
  static validateAttributeCreation(data: unknown) {
    return attributeCreationSchema.parse(data);
  }

  // Validate attribute update data
  static validateAttributeUpdate(data: unknown) {
    return attributeUpdateSchema.parse(data);
  }

  // Check if attribute name is available
  static async isNameAvailable(
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const supabase = createClient();

    let query = supabase
      .from("attribute_definitions")
      .select("id")
      .eq("name", name);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code === "PGRST116") {
      return true; // Name is available
    }

    return !data; // Name is available if no data returned
  }

  /**
   * Generate unique name from display label
   */
  static generateName(displayLabel: string): string {
    return displayLabel
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/-+/g, "_") // Replace multiple hyphens with single underscore
      .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
  }

  // Validate attribute value against definition
  static validateAttributeValue(
    value: any,
    attribute: any,
  ): { isValid: boolean; error?: string } {
    const rules = attribute.validation_rules || {};

    // Check required
    if (
      attribute.is_required &&
      (value === null || value === undefined || value === "")
    ) {
      return {
        isValid: false,
        error: `${attribute.display_label} is required`,
      };
    }

    // Skip validation if empty and not required
    if (!value) return { isValid: true };

    // Type-specific validation
    switch (attribute.data_type) {
      case "text":
        return AttributeValidationHelpers.validateTextValue(
          value,
          rules,
          attribute.display_label,
        );
      case "number":
        return AttributeValidationHelpers.validateNumberValue(
          value,
          rules,
          attribute.display_label,
        );
      case "email":
        return AttributeValidationHelpers.validateEmailValue(
          value,
          attribute.display_label,
        );
      case "url":
        return AttributeValidationHelpers.validateUrlValue(
          value,
          attribute.display_label,
        );
      case "select":
        return AttributeValidationHelpers.validateSelectValue(
          value,
          attribute.options?.options || [],
          attribute.display_label,
        );
      case "multi_select":
        return AttributeValidationHelpers.validateMultiSelectValue(
          value,
          attribute.options?.options || [],
          attribute.display_label,
        );
      case "date":
        return AttributeValidationHelpers.validateDateValue(
          value,
          attribute.display_label,
        );
      case "boolean":
        return AttributeValidationHelpers.validateBooleanValue(
          value,
          attribute.display_label,
        );
      default:
        return { isValid: true };
    }
  }
}
