import { AttributeMappingHelper } from "../attributeMappingHelper";
import { AttributeValidationHelper } from "../attributeValidationHelper";

interface AttributeMapping {
  externalAttribute: string;
  internalField: string;
  mappingType: "direct" | "transform" | "composite";
  transformation?: (value: any) => any;
  validation?: (value: any) => boolean;
  isRequired: boolean;
  defaultValue?: any;
}

// Core mappings extracted to reduce file size
export const CORE_MAPPINGS: Record<string, AttributeMapping> = {
  id: {
    externalAttribute: "product_id",
    internalField: "external_id",
    mappingType: "direct",
    isRequired: true,
  },
  title: {
    externalAttribute: "product_name",
    internalField: "name",
    mappingType: "direct",
    isRequired: true,
  },
  description: {
    externalAttribute: "product_description",
    internalField: "description",
    mappingType: "transform",
    transformation: (value: string) => value?.substring(0, 500) || "",
    isRequired: false,
  },
  location: {
    externalAttribute: "location",
    internalField: "location",
    mappingType: "direct",
    isRequired: false,
    defaultValue: "Local pickup available",
  },
  images: {
    externalAttribute: "image_urls",
    internalField: "images",
    mappingType: "transform",
    transformation: (value: string | string[]) => {
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    },
    isRequired: false,
    defaultValue: [],
  },
  availability: {
    externalAttribute: "in_stock",
    internalField: "is_available",
    mappingType: "transform",
    transformation: (value: any) => Boolean(value),
    isRequired: false,
    defaultValue: true,
  },
  condition: {
    externalAttribute: "condition",
    internalField: "condition",
    mappingType: "transform",
    transformation: (value: string) =>
      AttributeMappingHelper.normalizeCondition(value),
    isRequired: false,
    defaultValue: "good",
  },
};

// Helper function to process category attributes
export function processCategoryAttributes(
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
        validation: AttributeValidationHelper.createValidator(
          attr.attribute_definitions?.validation_rules,
        ),
      };
    }
  });

  return mappings;
}

// Helper function to process category attributes for validation
export function processCategoryAttributesForValidation(
  attributes: any[],
): any[] {
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
