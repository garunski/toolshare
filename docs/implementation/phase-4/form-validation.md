# Form Validation

## Dynamic Validation Rule Processing

### 1. Dynamic Validation Engine
- [ ] Create: `src/common/forms/DynamicValidationEngine.ts` (under 150 lines)

```typescript
// src/common/forms/DynamicValidationEngine.ts
import { z } from 'zod';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
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

export class DynamicValidationEngine {
  private attributes: AttributeDefinitionWithOptions[] = [];
  private crossFieldRules: CrossFieldValidationRule[] = [];
  private customValidators: Map<string, (value: any) => ValidationResult> = new Map();

  constructor(attributes: AttributeDefinitionWithOptions[]) {
    this.attributes = attributes;
    this.setupDefaultCrossFieldRules();
  }

  // Generate Zod schema from attributes
  generateZodSchema(): z.ZodObject<any> {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    this.attributes.forEach(attr => {
      let fieldSchema = this.createFieldSchema(attr);
      
      // Apply custom validators
      if (this.customValidators.has(attr.name)) {
        fieldSchema = fieldSchema.refine(
          (value) => this.customValidators.get(attr.name)!(value).isValid,
          { message: `Custom validation failed for ${attr.display_label}` }
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

  private createFieldSchema(attr: AttributeDefinitionWithOptions): z.ZodTypeAny {
    const rules = attr.validation_rules || {};
    
    switch (attr.data_type) {
      case 'text':
      case 'email':
      case 'url':
        let textSchema = z.string();
        
        if (rules.min_length) {
          textSchema = textSchema.min(rules.min_length, 
            `${attr.display_label} must be at least ${rules.min_length} characters`);
        }
        
        if (rules.max_length) {
          textSchema = textSchema.max(rules.max_length,
            `${attr.display_label} must be no more than ${rules.max_length} characters`);
        }

        if (attr.data_type === 'email') {
          textSchema = textSchema.email(`Please enter a valid email address`);
        }

        if (attr.data_type === 'url') {
          textSchema = textSchema.url(`Please enter a valid URL`);
        }

        if (rules.pattern) {
          const regex = new RegExp(rules.pattern);
          textSchema = textSchema.regex(regex, 
            rules.pattern_message || `${attr.display_label} format is invalid`);
        }

        return textSchema;

      case 'number':
        let numberSchema = z.number({ 
          invalid_type_error: `${attr.display_label} must be a number` 
        });

        if (rules.min_value !== undefined) {
          numberSchema = numberSchema.min(rules.min_value,
            `${attr.display_label} must be at least ${rules.min_value}`);
        }

        if (rules.max_value !== undefined) {
          numberSchema = numberSchema.max(rules.max_value,
            `${attr.display_label} must be no more than ${rules.max_value}`);
        }

        if (rules.step) {
          numberSchema = numberSchema.refine(
            (val) => (val * (1 / rules.step!)) % 1 === 0,
            { message: `${attr.display_label} must be in increments of ${rules.step}` }
          );
        }

        return numberSchema;

      case 'boolean':
        return z.boolean({ 
          invalid_type_error: `${attr.display_label} must be true or false` 
        });

      case 'date':
        return z.string()
          .refine(val => !isNaN(Date.parse(val)), {
            message: `${attr.display_label} must be a valid date`
          })
          .refine(val => {
            if (rules.min_date) {
              return new Date(val) >= new Date(rules.min_date);
            }
            return true;
          }, {
            message: `${attr.display_label} cannot be before ${rules.min_date}`
          })
          .refine(val => {
            if (rules.max_date) {
              return new Date(val) <= new Date(rules.max_date);
            }
            return true;
          }, {
            message: `${attr.display_label} cannot be after ${rules.max_date}`
          });

      case 'select':
        const selectOptions = attr.parsedOptions?.map(opt => opt.value) || [];
        if (selectOptions.length === 0) {
          return z.string();
        }
        return z.enum(selectOptions as [string, ...string[]], {
          errorMap: () => ({ message: `Please select a valid ${attr.display_label}` })
        });

      case 'multi_select':
        const multiOptions = attr.parsedOptions?.map(opt => opt.value) || [];
        let multiSchema = z.array(z.string());

        if (rules.min_selections) {
          multiSchema = multiSchema.min(rules.min_selections,
            `Please select at least ${rules.min_selections} option${rules.min_selections > 1 ? 's' : ''}`);
        }

        if (rules.max_selections) {
          multiSchema = multiSchema.max(rules.max_selections,
            `Please select no more than ${rules.max_selections} option${rules.max_selections > 1 ? 's' : ''}`);
        }

        if (multiOptions.length > 0) {
          multiSchema = multiSchema.refine(
            (arr) => arr.every(val => multiOptions.includes(val)),
            { message: `Invalid selection for ${attr.display_label}` }
          );
        }

        return multiSchema;

      default:
        return z.string();
    }
  }

  // Real-time field validation
  validateField(fieldName: string, value: any): ValidationResult {
    const attribute = this.attributes.find(attr => attr.name === fieldName);
    if (!attribute) {
      return { isValid: false, errors: [{ 
        field: fieldName, 
        message: 'Field not found', 
        code: 'FIELD_NOT_FOUND',
        severity: 'error'
      }], warnings: [] };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic required validation
    if (attribute.is_required && (!value || value === '')) {
      errors.push({
        field: fieldName,
        message: `${attribute.display_label} is required`,
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Skip further validation if field is empty and not required
    if (!value || value === '') {
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
      warnings
    };
  }

  private validateFieldType(attribute: AttributeDefinitionWithOptions, value: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const rules = attribute.validation_rules || {};

    switch (attribute.data_type) {
      case 'text':
      case 'email':
      case 'url':
        const strValue = String(value);
        
        if (rules.min_length && strValue.length < rules.min_length) {
          errors.push({
            field: attribute.name,
            message: `Must be at least ${rules.min_length} characters`,
            code: 'MIN_LENGTH',
            severity: 'error'
          });
        }

        if (rules.max_length && strValue.length > rules.max_length) {
          errors.push({
            field: attribute.name,
            message: `Must be no more than ${rules.max_length} characters`,
            code: 'MAX_LENGTH',
            severity: 'error'
          });
        }

        // Warning for approaching max length
        if (rules.max_length && strValue.length > rules.max_length * 0.9) {
          warnings.push({
            field: attribute.name,
            message: `Approaching character limit (${strValue.length}/${rules.max_length})`,
            code: 'APPROACHING_LIMIT',
            suggestion: 'Consider shortening your text'
          });
        }

        if (attribute.data_type === 'email' && !this.isValidEmail(strValue)) {
          errors.push({
            field: attribute.name,
            message: 'Please enter a valid email address',
            code: 'INVALID_EMAIL',
            severity: 'error'
          });
        }

        if (attribute.data_type === 'url' && !this.isValidUrl(strValue)) {
          errors.push({
            field: attribute.name,
            message: 'Please enter a valid URL',
            code: 'INVALID_URL',
            severity: 'error'
          });
        }

        break;

      case 'number':
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          errors.push({
            field: attribute.name,
            message: 'Must be a valid number',
            code: 'INVALID_NUMBER',
            severity: 'error'
          });
          break;
        }

        if (rules.min_value !== undefined && numValue < rules.min_value) {
          errors.push({
            field: attribute.name,
            message: `Must be at least ${rules.min_value}`,
            code: 'MIN_VALUE',
            severity: 'error'
          });
        }

        if (rules.max_value !== undefined && numValue > rules.max_value) {
          errors.push({
            field: attribute.name,
            message: `Must be no more than ${rules.max_value}`,
            code: 'MAX_VALUE',
            severity: 'error'
          });
        }

        break;

      case 'multi_select':
        if (!Array.isArray(value)) {
          errors.push({
            field: attribute.name,
            message: 'Must be a list of selections',
            code: 'INVALID_ARRAY',
            severity: 'error'
          });
          break;
        }

        if (rules.min_selections && value.length < rules.min_selections) {
          errors.push({
            field: attribute.name,
            message: `Please select at least ${rules.min_selections} option${rules.min_selections > 1 ? 's' : ''}`,
            code: 'MIN_SELECTIONS',
            severity: 'error'
          });
        }

        if (rules.max_selections && value.length > rules.max_selections) {
          errors.push({
            field: attribute.name,
            message: `Please select no more than ${rules.max_selections} option${rules.max_selections > 1 ? 's' : ''}`,
            code: 'MAX_SELECTIONS',
            severity: 'error'
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
    this.crossFieldRules.forEach(rule => {
      const result = rule.validator(formData);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private setupDefaultCrossFieldRules() {
    // Example: Date range validation
    this.crossFieldRules.push({
      name: 'date_range',
      fields: ['start_date', 'end_date'],
      validator: (values) => {
        const errors: ValidationError[] = [];
        
        if (values.start_date && values.end_date) {
          const start = new Date(values.start_date);
          const end = new Date(values.end_date);
          
          if (start > end) {
            errors.push({
              field: 'end_date',
              message: 'End date must be after start date',
              code: 'INVALID_DATE_RANGE',
              severity: 'error'
            });
          }
        }

        return { isValid: errors.length === 0, errors, warnings: [] };
      },
      message: 'Invalid date range'
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
  addCustomValidator(fieldName: string, validator: (value: any) => ValidationResult) {
    this.customValidators.set(fieldName, validator);
  }

  // Add cross-field rule
  addCrossFieldRule(rule: CrossFieldValidationRule) {
    this.crossFieldRules.push(rule);
  }
}
```

### 2. Real-Time Validation Hook
- [ ] Create: `src/common/forms/useRealTimeValidation.ts` (under 150 lines)

```typescript
// src/common/forms/useRealTimeValidation.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { DynamicValidationEngine, ValidationResult } from './DynamicValidationEngine';
import { FormUtils } from './FormStateManager';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface UseRealTimeValidationProps {
  attributes: AttributeDefinitionWithOptions[];
  formData: Record<string, any>;
  debounceMs?: number;
}

interface ValidationState {
  fieldErrors: Record<string, string[]>;
  fieldWarnings: Record<string, string[]>;
  isValidating: boolean;
  isFormValid: boolean;
  touchedFields: Set<string>;
}

export function useRealTimeValidation({
  attributes,
  formData,
  debounceMs = 300
}: UseRealTimeValidationProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    fieldErrors: {},
    fieldWarnings: {},
    isValidating: false,
    isFormValid: false,
    touchedFields: new Set()
  });

  const [debouncedFormData] = useDebounce(formData, debounceMs);

  // Create validation engine
  const validationEngine = useMemo(() => {
    return new DynamicValidationEngine(attributes);
  }, [attributes]);

  // Validate single field
  const validateField = useCallback((fieldName: string, value: any): ValidationResult => {
    return validationEngine.validateField(fieldName, value);
  }, [validationEngine]);

  // Validate entire form
  const validateForm = useCallback((data: Record<string, any>): ValidationResult => {
    const fieldResults: Record<string, ValidationResult> = {};
    const allErrors: Record<string, string[]> = {};
    const allWarnings: Record<string, string[]> = {};
    let hasErrors = false;

    // Validate each field
    attributes.forEach(attr => {
      const result = validationEngine.validateField(attr.name, data[attr.name]);
      fieldResults[attr.name] = result;

      if (result.errors.length > 0) {
        allErrors[attr.name] = result.errors.map(e => e.message);
        hasErrors = true;
      }

      if (result.warnings.length > 0) {
        allWarnings[attr.name] = result.warnings.map(w => w.message);
      }
    });

    // Cross-field validation
    const crossFieldResult = validationEngine.validateForm(data);
    crossFieldResult.errors.forEach(error => {
      if (!allErrors[error.field]) {
        allErrors[error.field] = [];
        hasErrors = true;
      }
      allErrors[error.field].push(error.message);
    });

    crossFieldResult.warnings.forEach(warning => {
      if (!allWarnings[warning.field]) {
        allWarnings[warning.field] = [];
      }
      allWarnings[warning.field].push(warning.message);
    });

    return {
      isValid: !hasErrors,
      errors: Object.values(allErrors).flat().map(message => ({
        field: '',
        message,
        code: '',
        severity: 'error' as const
      })),
      warnings: Object.values(allWarnings).flat().map(message => ({
        field: '',
        message,
        code: '',
        suggestion: ''
      }))
    };
  }, [validationEngine, attributes]);

  // Mark field as touched
  const touchField = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, fieldName])
    }));
  }, []);

  // Get field error message
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const errors = validationState.fieldErrors[fieldName];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }, [validationState.fieldErrors]);

  // Get field warning message
  const getFieldWarning = useCallback((fieldName: string): string | undefined => {
    const warnings = validationState.fieldWarnings[fieldName];
    return warnings && warnings.length > 0 ? warnings[0] : undefined;
  }, [validationState.fieldWarnings]);

  // Check if field has been touched
  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return validationState.touchedFields.has(fieldName);
  }, [validationState.touchedFields]);

  // Get validation status for field
  const getFieldStatus = useCallback((fieldName: string): 'valid' | 'invalid' | 'warning' | 'untouched' => {
    if (!isFieldTouched(fieldName)) return 'untouched';
    
    const hasError = validationState.fieldErrors[fieldName]?.length > 0;
    const hasWarning = validationState.fieldWarnings[fieldName]?.length > 0;
    
    if (hasError) return 'invalid';
    if (hasWarning) return 'warning';
    return 'valid';
  }, [validationState.fieldErrors, validationState.fieldWarnings, isFieldTouched]);

  // Run validation when form data changes
  useEffect(() => {
    if (Object.keys(debouncedFormData).length === 0) return;

    setValidationState(prev => ({ ...prev, isValidating: true }));

    const result = validateForm(debouncedFormData);
    
    // Group errors and warnings by field
    const fieldErrors: Record<string, string[]> = {};
    const fieldWarnings: Record<string, string[]> = {};

    attributes.forEach(attr => {
      const fieldResult = validateField(attr.name, debouncedFormData[attr.name]);
      
      if (fieldResult.errors.length > 0) {
        fieldErrors[attr.name] = fieldResult.errors.map(e => e.message);
      }
      
      if (fieldResult.warnings.length > 0) {
        fieldWarnings[attr.name] = fieldResult.warnings.map(w => w.message);
      }
    });

    setValidationState(prev => ({
      ...prev,
      fieldErrors,
      fieldWarnings,
      isValidating: false,
      isFormValid: result.isValid
    }));
  }, [debouncedFormData, validateForm, validateField, attributes]);

  // Clear validation for field
  const clearFieldValidation = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newFieldErrors = { ...prev.fieldErrors };
      const newFieldWarnings = { ...prev.fieldWarnings };
      const newTouchedFields = new Set(prev.touchedFields);

      delete newFieldErrors[fieldName];
      delete newFieldWarnings[fieldName];
      newTouchedFields.delete(fieldName);

      return {
        ...prev,
        fieldErrors: newFieldErrors,
        fieldWarnings: newFieldWarnings,
        touchedFields: newTouchedFields
      };
    });
  }, []);

  // Reset all validation
  const resetValidation = useCallback(() => {
    setValidationState({
      fieldErrors: {},
      fieldWarnings: {},
      isValidating: false,
      isFormValid: false,
      touchedFields: new Set()
    });
  }, []);

  return {
    // State
    fieldErrors: validationState.fieldErrors,
    fieldWarnings: validationState.fieldWarnings,
    isValidating: validationState.isValidating,
    isFormValid: validationState.isFormValid,
    touchedFields: validationState.touchedFields,

    // Methods
    validateField,
    validateForm,
    touchField,
    getFieldError,
    getFieldWarning,
    isFieldTouched,
    getFieldStatus,
    clearFieldValidation,
    resetValidation,

    // Validation engine for advanced usage
    validationEngine
  };
}
```

### 3. Validation Message Component
- [ ] Create: `src/common/forms/ValidationMessage.tsx` (under 150 lines)

```tsx
// src/common/forms/ValidationMessage.tsx
'use client';

import { ExclamationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  suggestion?: string;
  className?: string;
}

export function ValidationMessage({ type, message, suggestion, className = '' }: Props) {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-400',
          IconComponent: ExclamationCircleIcon
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-400',
          IconComponent: ExclamationTriangleIcon
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-400',
          IconComponent: CheckCircleIcon
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-400',
          IconComponent: ExclamationCircleIcon
        };
    }
  };

  const styles = getStyles();
  const { IconComponent } = styles;

  return (
    <div className={`border rounded-md p-3 ${styles.container} ${className}`}>
      <div className="flex items-start space-x-2">
        <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
          {suggestion && (
            <p className="text-xs mt-1 opacity-80">{suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Success Criteria
- [ ] Dynamic validation engine handles all attribute types
- [ ] Real-time validation with debounced feedback
- [ ] Cross-field validation support
- [ ] Custom validation rule integration
- [ ] Comprehensive error and warning messages
- [ ] Validation state management with touched fields
- [ ] All files under 150 lines with proper imports 