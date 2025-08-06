import { createClient } from "@/common/supabase/client";

import { ItemAttributeValueValidator } from "./itemAttributeValueValidator";

export class ItemAttributeValidator {
  // Validate item attributes against category requirements
  static async validateItemAttributes(
    categoryId: string,
    attributes: Record<string, any>,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const supabase = createClient();
    const errors: string[] = [];

    // Get category attributes
    const { data: categoryAttributes } = await supabase
      .from("category_attributes")
      .select(
        `
        is_required,
        attribute_definitions(*)
      `,
      )
      .eq("category_id", categoryId);

    if (!categoryAttributes) {
      return { isValid: true, errors: [] };
    }

    // Check required attributes
    for (const ca of categoryAttributes) {
      const attr = ca.attribute_definitions as any;
      const isRequired = ca.is_required;
      const value = attributes[attr.name];

      if (
        isRequired &&
        (value === null || value === undefined || value === "")
      ) {
        errors.push(`${attr.display_label} is required`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate attribute values against their definitions
  static async validateAttributeValues(
    categoryId: string,
    attributes: Record<string, any>,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const supabase = createClient();
    const errors: string[] = [];

    // Get category attributes with definitions
    const { data: categoryAttributes } = await supabase
      .from("category_attributes")
      .select(
        `
        attribute_definitions(*)
      `,
      )
      .eq("category_id", categoryId);

    if (!categoryAttributes) {
      return { isValid: true, errors: [] };
    }

    // Validate each attribute value
    for (const ca of categoryAttributes) {
      const attr = ca.attribute_definitions as any;
      const value = attributes[attr.name];

      if (value !== null && value !== undefined && value !== "") {
        const validation =
          ItemAttributeValueValidator.validateSingleAttributeValue(value, attr);
        if (!validation.isValid) {
          errors.push(validation.error!);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
