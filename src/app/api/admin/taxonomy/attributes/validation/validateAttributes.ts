export class ValidateAttributes {
  /**
   * Create validation function from rules
   */
  static checkAttributeValidity(
    rules: any,
  ): ((value: any) => boolean) | undefined {
    if (!rules) return undefined;

    return (value: any) => {
      // Basic validation based on rules
      if (rules.required && (!value || value === "")) {
        return false;
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        return false;
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        return false;
      }

      if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
        return false;
      }

      return true;
    };
  }

  /**
   * Validate mapped data against category requirements
   */
  static validateData(
    categoryAttributes: any[],
    mappedData: Record<string, any>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    categoryAttributes.forEach((attr) => {
      if (
        attr.isRequired &&
        (!mappedData[attr.name] || mappedData[attr.name] === "")
      ) {
        errors.push(`Required field '${attr.name}' is missing`);
      }
    });

    // Validate field types and rules
    Object.entries(mappedData).forEach(([fieldName, value]) => {
      const attr = categoryAttributes.find((a) => a.name === fieldName);
      if (attr && attr.validationRules) {
        const validator = this.checkAttributeValidity(attr.validationRules);
        if (validator && !validator(value)) {
          errors.push(`Field '${fieldName}' failed validation`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
