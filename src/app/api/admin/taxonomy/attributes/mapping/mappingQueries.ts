import { createClient } from "@/common/supabase/client";

import { MappingHelpers } from "../helpers/mappingHelpers";

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
 * Database queries for attribute mapping
 */
export class MappingQueries {
  /**
   * Get category-specific attribute mappings
   */
  static async getCategorySpecificMappings(
    categoryId: number,
  ): Promise<Record<string, AttributeMapping>> {
    const supabase = createClient();

    const { data: categoryAttrs } = await supabase
      .from("category_attributes")
      .select(
        `
        attribute_definitions (
          name,
          display_label,
          data_type,
          validation_rules,
          default_value
        ),
        is_required,
        external_mapping
      `,
      )
      .eq("category_id", categoryId);

    return MappingHelpers.processCategoryAttributes(categoryAttrs || []);
  }

  /**
   * Get category attributes for validation
   */
  static async getCategoryAttributes(categoryId: number): Promise<any[]> {
    const supabase = createClient();

    const { data: attributes } = await supabase
      .from("category_attributes")
      .select(
        `
        attribute_definitions (
          name,
          data_type,
          validation_rules,
          default_value
        ),
        is_required
      `,
      )
      .eq("category_id", categoryId);

    return MappingHelpers.processCategoryAttributesForValidation(
      attributes || [],
    );
  }
}
