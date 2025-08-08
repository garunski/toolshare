import { CORE_MAPPINGS } from "../helpers/mappingHelpers";
import { ValidateAttributes } from "../validation/validateAttributes";

import { MappingQueries } from "./mappingQueries";
import { AttributeMappingHelper } from "./mappingSuggestions";

interface AttributeMapping {
  externalAttribute: string;
  internalField: string;
  mappingType: "direct" | "transform" | "composite";
  transformation?: (value: any) => any;
  validation?: (value: any) => boolean;
  isRequired: boolean;
  defaultValue?: any;
}

export class ManageAttributeMapping {
  /**
   * Map external taxonomy attributes to internal fields
   */
  static async mapAttributes(
    categoryId: number,
    externalData: Record<string, any>,
  ): Promise<Record<string, any>> {
    const categoryMappings =
      await MappingQueries.getCategorySpecificMappings(categoryId);
    const allMappings = { ...CORE_MAPPINGS, ...categoryMappings };

    const mappedData: Record<string, any> = {};

    // Apply core mappings
    Object.entries(allMappings).forEach(([internalField, mapping]) => {
      const externalValue = externalData[mapping.externalAttribute];
      const mappedValue = this.applyMapping(mapping, externalValue);

      if (mappedValue !== undefined) {
        mappedData[internalField] = mappedValue;
      } else if (mapping.isRequired && mapping.defaultValue !== undefined) {
        mappedData[internalField] = mapping.defaultValue;
      }
    });

    // Add category-specific attributes
    const categoryAttributes =
      await MappingQueries.getCategoryAttributes(categoryId);
    categoryAttributes.forEach((attr) => {
      if (!mappedData[attr.name] && attr.defaultValue) {
        mappedData[attr.name] = attr.defaultValue;
      }
    });

    return mappedData;
  }

  /**
   * Apply mapping transformation to a value
   */
  private static applyMapping(mapping: AttributeMapping, value: any): any {
    if (value === undefined || value === null) {
      return mapping.defaultValue;
    }

    let mappedValue = value;

    // Apply transformation if defined
    if (mapping.transformation) {
      mappedValue = mapping.transformation(value);
    }

    // Apply validation if defined
    if (mapping.validation && !mapping.validation(mappedValue)) {
      throw new Error(
        `Validation failed for ${mapping.internalField}: ${mappedValue}`,
      );
    }

    return mappedValue;
  }

  /**
   * Validate mapped data against category requirements
   */
  static async validateMappedData(
    categoryId: number,
    mappedData: Record<string, any>,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const categoryAttributes =
      await MappingQueries.getCategoryAttributes(categoryId);
    return ValidateAttributes.validateData(categoryAttributes, mappedData);
  }

  /**
   * Get mapping suggestions for external data
   */
  static async getMappingSuggestions(
    categoryId: number,
    externalData: Record<string, any>,
  ): Promise<Record<string, string>> {
    const categoryMappings =
      await MappingQueries.getCategorySpecificMappings(categoryId);
    return AttributeMappingHelper.getSuggestions(
      categoryMappings,
      externalData,
    );
  }
}
