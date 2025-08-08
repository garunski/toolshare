import { AttributeMapping } from "./mappingTypes";

/**
 * Validation helpers for attribute mappings
 */
export class MappingValidation {
  /**
   * Create a validator function from validation rules
   */
  static createValidator(
    validationRules: any,
  ): ((value: any) => boolean) | undefined {
    if (!validationRules) return undefined;

    return (value: any) => {
      // Basic validation logic
      if (
        validationRules.required &&
        (value === null || value === undefined || value === "")
      ) {
        return false;
      }

      if (
        validationRules.minLength &&
        typeof value === "string" &&
        value.length < validationRules.minLength
      ) {
        return false;
      }

      if (
        validationRules.maxLength &&
        typeof value === "string" &&
        value.length > validationRules.maxLength
      ) {
        return false;
      }

      if (
        validationRules.min &&
        typeof value === "number" &&
        value < validationRules.min
      ) {
        return false;
      }

      if (
        validationRules.max &&
        typeof value === "number" &&
        value > validationRules.max
      ) {
        return false;
      }

      if (validationRules.pattern && typeof value === "string") {
        const regex = new RegExp(validationRules.pattern);
        if (!regex.test(value)) {
          return false;
        }
      }

      return true;
    };
  }

  /**
   * Validate attribute mapping configuration
   */
  static validateAttributeMapping(
    mappings: Record<string, AttributeMapping>,
  ): boolean {
    for (const [key, mapping] of Object.entries(mappings)) {
      if (!mapping.externalAttribute || !mapping.internalField) {
        throw new Error(
          `Invalid mapping for ${key}: missing externalAttribute or internalField`,
        );
      }

      if (mapping.validation && typeof mapping.validation !== "function") {
        throw new Error(`Invalid validation function for ${key}`);
      }

      if (
        mapping.transformation &&
        typeof mapping.transformation !== "function"
      ) {
        throw new Error(`Invalid transformation function for ${key}`);
      }
    }

    return true;
  }
}
