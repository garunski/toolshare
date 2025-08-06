export class ItemAttributeValueValidator {
  // Validate a single attribute value
  static validateSingleAttributeValue(
    value: any,
    attribute: any,
  ): { isValid: boolean; error?: string } {
    const rules = attribute.validation_rules || {};

    // Type-specific validation
    switch (attribute.data_type) {
      case "text":
        return this.validateTextValue(value, rules, attribute.display_label);
      case "number":
        return this.validateNumberValue(value, rules, attribute.display_label);
      case "email":
        return this.validateEmailValue(value, attribute.display_label);
      case "url":
        return this.validateUrlValue(value, attribute.display_label);
      case "select":
        return this.validateSelectValue(
          value,
          attribute.options?.options || [],
          attribute.display_label,
        );
      case "multi_select":
        return this.validateMultiSelectValue(
          value,
          attribute.options?.options || [],
          attribute.display_label,
        );
      case "date":
        return this.validateDateValue(value, attribute.display_label);
      case "boolean":
        return this.validateBooleanValue(value, attribute.display_label);
      default:
        return { isValid: true };
    }
  }

  private static validateTextValue(value: string, rules: any, label: string) {
    if (rules.minLength && value.length < rules.minLength) {
      return {
        isValid: false,
        error: `${label} must be at least ${rules.minLength} characters`,
      };
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        isValid: false,
        error: `${label} must be less than ${rules.maxLength} characters`,
      };
    }
    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      return { isValid: false, error: `${label} format is invalid` };
    }
    return { isValid: true };
  }

  private static validateNumberValue(value: number, rules: any, label: string) {
    const num = Number(value);
    if (isNaN(num)) {
      return { isValid: false, error: `${label} must be a valid number` };
    }
    if (rules.minimum !== undefined && num < rules.minimum) {
      return {
        isValid: false,
        error: `${label} must be at least ${rules.minimum}`,
      };
    }
    if (rules.maximum !== undefined && num > rules.maximum) {
      return {
        isValid: false,
        error: `${label} must be at most ${rules.maximum}`,
      };
    }
    return { isValid: true };
  }

  private static validateEmailValue(value: string, label: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        error: `${label} must be a valid email address`,
      };
    }
    return { isValid: true };
  }

  private static validateUrlValue(value: string, label: string) {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: `${label} must be a valid URL` };
    }
  }

  private static validateSelectValue(
    value: string,
    options: any[],
    label: string,
  ) {
    if (!options.some((opt: any) => opt.value === value)) {
      return {
        isValid: false,
        error: `${label} must be one of the available options`,
      };
    }
    return { isValid: true };
  }

  private static validateMultiSelectValue(
    values: string[],
    options: any[],
    label: string,
  ) {
    if (!Array.isArray(values)) {
      return { isValid: false, error: `${label} must be an array of values` };
    }
    const validValues = options.map((opt: any) => opt.value);
    const invalidValues = values.filter((val) => !validValues.includes(val));
    if (invalidValues.length > 0) {
      return {
        isValid: false,
        error: `${label} contains invalid options: ${invalidValues.join(", ")}`,
      };
    }
    return { isValid: true };
  }

  private static validateDateValue(value: string, label: string) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: `${label} must be a valid date` };
    }
    return { isValid: true };
  }

  private static validateBooleanValue(value: any, label: string) {
    if (typeof value !== "boolean") {
      return { isValid: false, error: `${label} must be true or false` };
    }
    return { isValid: true };
  }
}
