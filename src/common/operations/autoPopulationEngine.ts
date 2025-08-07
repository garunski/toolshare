import { createClient } from "@/common/supabase/client";

import { findSimilarItems } from "../../app/api/(app)/tools/suggestions/helpers/similarItemsHelper";

import { CategoryBasedSuggestions } from "./categoryBasedSuggestions";
import { SimilarItemSuggestions } from "./similarItemSuggestions";
import { SmartDefaults } from "./smartDefaults";

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

interface AttributeDefinition {
  name: string;
  display_label: string;
  data_type: string;
  validation_rules: any;
  default_value: any;
}

interface CategoryAttribute {
  attribute_definitions: AttributeDefinition;
  is_required: boolean;
  display_order: number;
}

// Helper function to process category attributes
function processCategoryAttributes(categoryAttrs: any[]): CategoryRequirements {
  const requiredFields: string[] = [];
  const optionalFields: string[] = [];
  const fieldTypes: Record<string, string> = {};
  const validationRules: Record<string, any> = {};

  categoryAttrs?.forEach((attr) => {
    const fieldName = attr.attribute_definitions?.name;
    if (fieldName) {
      if (attr.is_required) {
        requiredFields.push(fieldName);
      } else {
        optionalFields.push(fieldName);
      }
      fieldTypes[fieldName] = attr.attribute_definitions?.data_type || "";
      validationRules[fieldName] = attr.attribute_definitions?.validation_rules;
    }
  });

  return {
    requiredFields,
    optionalFields,
    fieldTypes,
    validationRules,
  };
}

export class AutoPopulationEngine {
  /**
   * Get field suggestions based on category and item context
   */
  static async getFieldSuggestions(
    categoryId: number,
    itemContext: {
      name: string;
      description?: string;
      attributes?: Record<string, any>;
    },
  ): Promise<FieldSuggestion[]> {
    const [categoryReqs, similarItems] = await Promise.all([
      this.getCategoryRequirements(categoryId),
      findSimilarItems(categoryId, itemContext),
    ]);

    const suggestions: FieldSuggestion[] = [];

    // Add category-specific field suggestions
    suggestions.push(
      ...CategoryBasedSuggestions.generate(categoryReqs, itemContext),
    );

    // Add suggestions from similar items
    suggestions.push(
      ...SimilarItemSuggestions.generate(similarItems, itemContext),
    );

    // Add smart defaults
    suggestions.push(...SmartDefaults.generate(categoryReqs, itemContext));

    return suggestions
      .filter((s) => s.confidence > 20)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get category requirements and field definitions
   */
  private static async getCategoryRequirements(
    categoryId: number,
  ): Promise<CategoryRequirements> {
    const supabase = createClient();

    // Get category attributes
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
        display_order
      `,
      )
      .eq("category_id", categoryId);

    return processCategoryAttributes(categoryAttrs || []);
  }
}
