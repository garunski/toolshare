import { MappingConflictResolution } from "./mappingConflictResolution";
import { AttributeMapping } from "./mappingTypes";
import { MappingValidation } from "./mappingValidation";

/**
 * Mapping helpers class for managing attribute mappings
 */
export class MappingHelpers {
  /**
   * Process category attributes to create mappings
   */
  static processCategoryAttributes(
    categoryAttrs: any[],
  ): Record<string, AttributeMapping> {
    const mappings: Record<string, AttributeMapping> = {};

    categoryAttrs?.forEach((attr) => {
      const fieldName = attr.attribute_definitions?.name;
      const externalMapping = attr.external_mapping;

      if (externalMapping && fieldName) {
        mappings[fieldName] = {
          externalAttribute: externalMapping,
          internalField: fieldName,
          mappingType: "direct",
          isRequired: attr.is_required,
          defaultValue: attr.attribute_definitions?.default_value,
          validation: MappingValidation.createValidator(
            attr.attribute_definitions?.validation_rules,
          ),
        };
      }
    });

    return mappings;
  }

  /**
   * Process category attributes for validation
   */
  static processCategoryAttributesForValidation(attributes: any[]): any[] {
    return (
      attributes?.map((attr) => ({
        name: attr.attribute_definitions?.name,
        dataType: attr.attribute_definitions?.data_type,
        validationRules: attr.attribute_definitions?.validation_rules,
        defaultValue: attr.attribute_definitions?.default_value,
        isRequired: attr.is_required,
      })) || []
    );
  }

  /**
   * Map attributes using the provided mappings
   */
  static mapAttributes(
    externalData: any,
    mappings: Record<string, AttributeMapping>,
  ): any {
    const mappedData: any = {};

    Object.entries(mappings).forEach(([key, mapping]) => {
      const externalValue = externalData[mapping.externalAttribute];

      if (externalValue !== undefined) {
        let value = externalValue;

        if (mapping.transformation) {
          value = mapping.transformation(value);
        }

        if (mapping.validation && !mapping.validation(value)) {
          throw new Error(`Validation failed for ${key}: ${value}`);
        }

        mappedData[mapping.internalField] = value;
      } else if (mapping.isRequired) {
        throw new Error(`Required field ${key} is missing`);
      } else if (mapping.defaultValue !== undefined) {
        mappedData[mapping.internalField] = mapping.defaultValue;
      }
    });

    return mappedData;
  }

  /**
   * Validate attribute mapping configuration
   */
  static validateAttributeMapping(
    mappings: Record<string, AttributeMapping>,
  ): boolean {
    return MappingValidation.validateAttributeMapping(mappings);
  }

  /**
   * Resolve attribute mapping conflicts
   */
  static resolveAttributeMappingConflicts(
    mappings1: Record<string, AttributeMapping>,
    mappings2: Record<string, AttributeMapping>,
  ): Record<string, AttributeMapping> {
    return MappingConflictResolution.resolveAttributeMappingConflicts(
      mappings1,
      mappings2,
    );
  }
}

// Re-export for backward compatibility
export { CORE_MAPPINGS } from "./mappingTypes";
