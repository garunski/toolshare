export class SocialAttributeValidator {
  // Validate a single social attribute value
  static validateSingleSocialAttributeValue(
    value: any,
    attribute: any,
  ): { isValid: boolean; error?: string } {
    const rules = attribute.validation_rules || {};

    // Type-specific validation
    switch (attribute.data_type) {
      case "text":
        return this.validateSocialTextValue(
          value,
          rules,
          attribute.display_label,
        );
      case "number":
        return this.validateSocialNumberValue(
          value,
          rules,
          attribute.display_label,
        );
      case "email":
        return this.validateSocialEmailValue(value, attribute.display_label);
      case "url":
        return this.validateSocialUrlValue(value, attribute.display_label);
      case "select":
        return this.validateSocialSelectValue(
          value,
          attribute.options?.options || [],
          attribute.display_label,
        );
      case "multi_select":
        return this.validateSocialMultiSelectValue(
          value,
          attribute.options?.options || [],
          attribute.display_label,
        );
      case "date":
        return this.validateSocialDateValue(value, attribute.display_label);
      case "boolean":
        return this.validateSocialBooleanValue(value, attribute.display_label);
      default:
        return { isValid: true };
    }
  }

  private static validateSocialTextValue(
    value: string,
    rules: any,
    label: string,
  ) {
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

  private static validateSocialNumberValue(
    value: number,
    rules: any,
    label: string,
  ) {
    const num = Number(value);
    if (isNaN(num))
      return { isValid: false, error: `${label} must be a valid number` };
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

  private static validateSocialEmailValue(value: string, label: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value)
      ? { isValid: true }
      : { isValid: false, error: `${label} must be a valid email address` };
  }

  private static validateSocialUrlValue(value: string, label: string) {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: `${label} must be a valid URL` };
    }
  }

  private static validateSocialSelectValue(
    value: string,
    options: any[],
    label: string,
  ) {
    return options.some((opt: any) => opt.value === value)
      ? { isValid: true }
      : {
          isValid: false,
          error: `${label} must be one of the available options`,
        };
  }

  private static validateSocialMultiSelectValue(
    values: string[],
    options: any[],
    label: string,
  ) {
    if (!Array.isArray(values)) {
      return { isValid: false, error: `${label} must be an array of values` };
    }
    const validValues = options.map((opt: any) => opt.value);
    const invalidValues = values.filter((val) => !validValues.includes(val));
    return invalidValues.length > 0
      ? {
          isValid: false,
          error: `${label} contains invalid options: ${invalidValues.join(", ")}`,
        }
      : { isValid: true };
  }

  private static validateSocialDateValue(value: string, label: string) {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? { isValid: false, error: `${label} must be a valid date` }
      : { isValid: true };
  }

  private static validateSocialBooleanValue(value: any, label: string) {
    return typeof value === "boolean"
      ? { isValid: true }
      : { isValid: false, error: `${label} must be true or false` };
  }
}
