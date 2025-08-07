import { createClient } from "@/common/supabase/client";

import { AttributeMappingHelper } from "./attributeMappingHelper";
import { AttributeValidationHelper } from "./attributeValidationHelper";
import {
  CORE_MAPPINGS,
  processCategoryAttributes,
  processCategoryAttributesForValidation,
} from "./helpers/attributeMappingHelpers";

interface AttributeMapping {
  externalAttribute: string;
  internalField: string;
  mappingType: "direct" | "transform" | "composite";
  transformation?: (value: any) => any;
  validation?: (value: any) => boolean;
  isRequired: boolean;
  defaultValue?: any;
}

export class AttributeMappingSystem {
  /**
   * Map external taxonomy attributes to internal fields
   */
  static async mapExternalAttributes(
    categoryId: number,
    externalData: Record<string, any>,
  ): Promise<Record<string, any>> {
    const categoryMappings = await this.getCategorySpecificMappings(categoryId);
    const allMappings = { ...CORE_MAPPINGS, ...categoryMappings };

    const mappedData: Record<string, any> = {};

    // Apply core mappings
    Object.entries(allMappings).forEach(([internalField, mapping]) => {
      const externalValue = externalData[mapping.externalAttribute];
      const mappedValue = AttributeMappingHelper.applyMapping(
        mapping,
        externalValue,
      );

      if (mappedValue !== undefined) {
        mappedData[internalField] = mappedValue;
      } else if (mapping.isRequired && mapping.defaultValue !== undefined) {
        mappedData[internalField] = mapping.defaultValue;
      }
    });

    // Add category-specific attributes
    const categoryAttributes = await this.getCategoryAttributes(categoryId);
    categoryAttributes.forEach((attr) => {
      if (!mappedData[attr.name] && attr.defaultValue) {
        mappedData[attr.name] = attr.defaultValue;
      }
    });

    return mappedData;
  }

  /**
   * Get category-specific attribute mappings
   */
  private static async getCategorySpecificMappings(
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

    return processCategoryAttributes(categoryAttrs || []);
  }

  /**
   * Get category attributes for validation
   */
  private static async getCategoryAttributes(
    categoryId: number,
  ): Promise<any[]> {
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

    return processCategoryAttributesForValidation(attributes || []);
  }

  /**
   * Validate mapped data against category requirements
   */
  static async validateMappedData(
    categoryId: number,
    mappedData: Record<string, any>,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const categoryAttributes = await this.getCategoryAttributes(categoryId);
    return AttributeValidationHelper.validateData(
      categoryAttributes,
      mappedData,
    );
  }

  /**
   * Get mapping suggestions for external data
   */
  static async getMappingSuggestions(
    categoryId: number,
    externalData: Record<string, any>,
  ): Promise<Record<string, string>> {
    const categoryMappings = await this.getCategorySpecificMappings(categoryId);
    return AttributeMappingHelper.getSuggestions(
      categoryMappings,
      externalData,
    );
  }
}
