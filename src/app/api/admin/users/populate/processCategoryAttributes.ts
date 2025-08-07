import type { CategoryRequirements } from "./types";

export function processCategoryAttributes(
  categoryAttrs: any[],
): CategoryRequirements {
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
