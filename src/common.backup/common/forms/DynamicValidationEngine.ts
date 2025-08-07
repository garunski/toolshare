import { z } from "zod";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface CrossFieldValidationRule {
  name: string;
  fields: string[];
  validator: (values: Record<string, any>) => ValidationResult;
  message: string;
}

export interface AttributeDefinitionWithOptions {
  id: string;
  name: string;
  display_label: string;
  data_type:
    | "text"
    | "number"
    | "boolean"
    | "date"
    | "select"
    | "multi_select"
    | "url"
    | "email";
  is_required: boolean;
  validation_rules?: Record<string, any>;
  default_value?: string;
  options?: Record<string, any>;
  display_order: number;
  help_text?: string;
  parsedOptions?: Array<{ value: string; label: string }>;
}

export class DynamicValidationEngine {
  private attributes: AttributeDefinitionWithOptions[] = [];
  private crossFieldRules: CrossFieldValidationRule[] = [];
  private customValidators: Map<string, (value: any) => ValidationResult> =
    new Map();

  constructor(attributes: AttributeDefinitionWithOptions[]) {
    this.attributes = attributes;
    this.setupDefaultCrossFieldRules();
  }

  // Generate Zod schema from attributes
  generateZodSchema(): z.ZodObject<any> {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    this.attributes.forEach((attr) => {
      let fieldSchema = this.createFieldSchema(attr);

      // Apply custom validators
      if (this.customValidators.has(attr.name)) {
        fieldSchema = fieldSchema.refine(
          (value) => this.customValidators.get(attr.name)!(value).isValid,
          { message: `Custom validation failed for ${attr.display_label}` },
        );
      }

      // Handle required fields
      if (!attr.is_required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[attr.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }

  private createFieldSchema(
    attr: AttributeDefinitionWithOptions,
  ): z.ZodTypeAny {
    const rules = attr.validation_rules || {};

    switch (attr.data_type) {
      case "text":
      case "email":
      case "url":
        let textSchema = z.string();

        if (rules.min_length) {
          textSchema = textSchema.min(
            rules.min_length,
            `${attr.display_label} must be at least ${rules.min_length} characters`,
          );
        }

        if (rules.max_length) {
          textSchema = textSchema.max(
            rules.max_length,
            `${attr.display_label} must be no more than ${rules.max_length} characters`,
          );
        }

        if (attr.data_type === "email") {
          textSchema = textSchema.email(`Please enter a valid email address`);
        }

        if (attr.data_type === "url") {
          textSchema = textSchema.url(`Please enter a valid URL`);
        }

        if (rules.pattern) {
          const regex = new RegExp(rules.pattern);
          textSchema = textSchema.regex(
            regex,
            rules.pattern_message || `${attr.display_label} format is invalid`,
          );
        }

        return textSchema;

      case "number":
        let numberSchema = z.number();

        if (rules.min_value !== undefined) {
          numberSchema = numberSchema.min(
            rules.min_value,
            `${attr.display_label} must be at least ${rules.min_value}`,
          );
        }

        if (rules.max_value !== undefined) {
          numberSchema = numberSchema.max(
            rules.max_value,
            `${attr.display_label} must be no more than ${rules.max_value}`,
          );
        }

        if (rules.step) {
          numberSchema = numberSchema.refine(
            (val) => (val * (1 / rules.step!)) % 1 === 0,
            {
              message: `${attr.display_label} must be in increments of ${rules.step}`,
            },
          );
        }

        return numberSchema;

      case "boolean":
        return z.boolean();

      case "date":
        return z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: `${attr.display_label} must be a valid date`,
          })
          .refine(
            (val) => {
              if (rules.min_date) {
                return new Date(val) >= new Date(rules.min_date);
              }
              return true;
            },
            {
              message: `${attr.display_label} cannot be before ${rules.min_date}`,
            },
          )
          .refine(
            (val) => {
              if (rules.max_date) {
                return new Date(val) <= new Date(rules.max_date);
              }
              return true;
            },
            {
              message: `${attr.display_label} cannot be after ${rules.max_date}`,
            },
          );

      case "select":
        const selectOptions = attr.parsedOptions?.map((opt) => opt.value) || [];
        if (selectOptions.length === 0) {
          return z.string();
        }
        return z.enum(
          selectOptions as [string, ...string[]],
          `Please select a valid ${attr.display_label}`,
        );

      case "multi_select":
        const multiOptions = attr.parsedOptions?.map((opt) => opt.value) || [];
        let multiSchema = z.array(z.string());

        if (rules.min_selections) {
          multiSchema = multiSchema.min(
            rules.min_selections,
            `Please select at least ${rules.min_selections} option${rules.min_selections > 1 ? "s" : ""}`,
          );
        }

        if (rules.max_selections) {
          multiSchema = multiSchema.max(
            rules.max_selections,
            `Please select no more than ${rules.max_selections} option${rules.max_selections > 1 ? "s" : ""}`,
          );
        }

        if (multiOptions.length > 0) {
          multiSchema = multiSchema.refine(
            (arr) => arr.every((val) => multiOptions.includes(val)),
            { message: `Invalid selection for ${attr.display_label}` },
          );
        }

        return multiSchema;

      default:
        return z.string();
    }
  }

  // Real-time field validation
  validateField(fieldName: string, value: any): ValidationResult {
    const attribute = this.attributes.find((attr) => attr.name === fieldName);
    if (!attribute) {
      return {
        isValid: false,
        errors: [
          {
            field: fieldName,
            message: "Field not found",
            code: "FIELD_NOT_FOUND",
            severity: "error",
          },
        ],
        warnings: [],
      };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic required validation
    if (attribute.is_required && (!value || value === "")) {
      errors.push({
        field: fieldName,
        message: `${attribute.display_label} is required`,
        code: "REQUIRED_FIELD",
        severity: "error",
      });
      return { isValid: false, errors, warnings };
    }

    // Skip further validation if field is empty and not required
    if (!value || value === "") {
      return { isValid: true, errors: [], warnings: [] };
    }

    // Type-specific validation
    const typeValidation = this.validateFieldType(attribute, value);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);

    // Custom validation
    if (this.customValidators.has(fieldName)) {
      const customResult = this.customValidators.get(fieldName)!(value);
      errors.push(...customResult.errors);
      warnings.push(...customResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateFieldType(
    attribute: AttributeDefinitionWithOptions,
    value: any,
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const rules = attribute.validation_rules || {};

    switch (attribute.data_type) {
      case "text":
      case "email":
      case "url":
        const strValue = String(value);

        if (rules.min_length && strValue.length < rules.min_length) {
          errors.push({
            field: attribute.name,
            message: `Must be at least ${rules.min_length} characters`,
            code: "MIN_LENGTH",
            severity: "error",
          });
        }

        if (rules.max_length && strValue.length > rules.max_length) {
          errors.push({
            field: attribute.name,
            message: `Must be no more than ${rules.max_length} characters`,
            code: "MAX_LENGTH",
            severity: "error",
          });
        }

        // Warning for approaching max length
        if (rules.max_length && strValue.length > rules.max_length * 0.9) {
          warnings.push({
            field: attribute.name,
            message: `Approaching character limit (${strValue.length}/${rules.max_length})`,
            code: "APPROACHING_LIMIT",
            suggestion: "Consider shortening your text",
          });
        }

        if (attribute.data_type === "email" && !this.isValidEmail(strValue)) {
          errors.push({
            field: attribute.name,
            message: "Please enter a valid email address",
            code: "INVALID_EMAIL",
            severity: "error",
          });
        }

        if (attribute.data_type === "url" && !this.isValidUrl(strValue)) {
          errors.push({
            field: attribute.name,
            message: "Please enter a valid URL",
            code: "INVALID_URL",
            severity: "error",
          });
        }

        break;

      case "number":
        const numValue = Number(value);

        if (isNaN(numValue)) {
          errors.push({
            field: attribute.name,
            message: "Must be a valid number",
            code: "INVALID_NUMBER",
            severity: "error",
          });
          break;
        }

        if (rules.min_value !== undefined && numValue < rules.min_value) {
          errors.push({
            field: attribute.name,
            message: `Must be at least ${rules.min_value}`,
            code: "MIN_VALUE",
            severity: "error",
          });
        }

        if (rules.max_value !== undefined && numValue > rules.max_value) {
          errors.push({
            field: attribute.name,
            message: `Must be no more than ${rules.max_value}`,
            code: "MAX_VALUE",
            severity: "error",
          });
        }

        break;

      case "multi_select":
        if (!Array.isArray(value)) {
          errors.push({
            field: attribute.name,
            message: "Must be a list of selections",
            code: "INVALID_ARRAY",
            severity: "error",
          });
          break;
        }

        if (rules.min_selections && value.length < rules.min_selections) {
          errors.push({
            field: attribute.name,
            message: `Please select at least ${rules.min_selections} option${rules.min_selections > 1 ? "s" : ""}`,
            code: "MIN_SELECTIONS",
            severity: "error",
          });
        }

        if (rules.max_selections && value.length > rules.max_selections) {
          errors.push({
            field: attribute.name,
            message: `Please select no more than ${rules.max_selections} option${rules.max_selections > 1 ? "s" : ""}`,
            code: "MAX_SELECTIONS",
            severity: "error",
          });
        }

        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Cross-field validation
  validateForm(formData: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Run cross-field rules
    this.crossFieldRules.forEach((rule) => {
      const result = rule.validator(formData);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private setupDefaultCrossFieldRules() {
    // Example: Date range validation
    this.crossFieldRules.push({
      name: "date_range",
      fields: ["start_date", "end_date"],
      validator: (values) => {
        const errors: ValidationError[] = [];

        if (values.start_date && values.end_date) {
          const start = new Date(values.start_date);
          const end = new Date(values.end_date);

          if (start > end) {
            errors.push({
              field: "end_date",
              message: "End date must be after start date",
              code: "INVALID_DATE_RANGE",
              severity: "error",
            });
          }
        }

        return { isValid: errors.length === 0, errors, warnings: [] };
      },
      message: "Invalid date range",
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Add custom validator
  addCustomValidator(
    fieldName: string,
    validator: (value: any) => ValidationResult,
  ) {
    this.customValidators.set(fieldName, validator);
  }

  // Add cross-field rule
  addCrossFieldRule(rule: CrossFieldValidationRule) {
    this.crossFieldRules.push(rule);
  }
}
