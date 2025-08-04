# Dynamic Form Engine

## Core Form Rendering Engine

### 1. Dynamic Form Builder Component
- [ ] Create: `src/common/forms/DynamicFormBuilder.tsx` (under 150 lines)

```tsx
// src/common/forms/DynamicFormBuilder.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DynamicField } from './DynamicField';
import { FormProgressIndicator } from './FormProgressIndicator';
import { useCategories } from '@/common/hooks/useCategories';
import { useAttributes } from '@/common/hooks/useAttributes';
import { CategoryOperations } from '@/common/operations/categoryOperations';
import type { Category, CategoryWithAttributes } from '@/types/categories';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface Props {
  externalCategoryId?: number;
  initialValues?: Record<string, any>;
  onCategoryChange?: (externalCategoryId: number) => void;
  onSubmit: (data: any) => Promise<void>;
  onFormChange?: (data: any, isValid: boolean) => void;
  children?: React.ReactNode;
}

export function DynamicFormBuilder({
  externalCategoryId,
  initialValues = {},
  onCategoryChange,
  onSubmit,
  onFormChange,
  children
}: Props) {
  const [categoryWithAttrs, setCategoryWithAttrs] = useState<CategoryWithAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Generate dynamic validation schema
  const validationSchema = useMemo(() => {
    if (!categoryWithAttrs?.attributes) {
      return z.object({});
    }

    const schemaFields: Record<string, z.ZodTypeAny> = {};

    categoryWithAttrs.attributes.forEach(attr => {
      let fieldSchema: z.ZodTypeAny;

      switch (attr.data_type) {
        case 'text':
        case 'email':
        case 'url':
          fieldSchema = z.string();
          if (attr.validation_rules?.min_length) {
            fieldSchema = fieldSchema.min(attr.validation_rules.min_length);
          }
          if (attr.validation_rules?.max_length) {
            fieldSchema = fieldSchema.max(attr.validation_rules.max_length);
          }
          if (attr.data_type === 'email') {
            fieldSchema = fieldSchema.email();
          }
          if (attr.data_type === 'url') {
            fieldSchema = fieldSchema.url();
          }
          break;

        case 'number':
          fieldSchema = z.number();
          if (attr.validation_rules?.min_value !== undefined) {
            fieldSchema = fieldSchema.min(attr.validation_rules.min_value);
          }
          if (attr.validation_rules?.max_value !== undefined) {
            fieldSchema = fieldSchema.max(attr.validation_rules.max_value);
          }
          break;

        case 'boolean':
          fieldSchema = z.boolean();
          break;

        case 'date':
          fieldSchema = z.string().refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
          });
          break;

        case 'select':
          const selectOptions = attr.parsedOptions?.map(opt => opt.value) || [];
          fieldSchema = z.enum(selectOptions as [string, ...string[]]);
          break;

        case 'multi_select':
          const multiOptions = attr.parsedOptions?.map(opt => opt.value) || [];
          fieldSchema = z.array(z.enum(multiOptions as [string, ...string[]]));
          break;

        default:
          fieldSchema = z.string();
      }

      // Handle required fields
      if (!attr.is_required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[attr.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [categoryWithAttrs]);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
    mode: 'onChange'
  });

  const { handleSubmit, watch, formState: { isValid } } = methods;
  const formData = watch();

  // Load category attributes when external category changes
  useEffect(() => {
    if (!externalCategoryId) {
      setCategoryWithAttrs(null);
      setLoading(false);
      return;
    }

    const loadCategoryAttributes = async () => {
      setLoading(true);
      try {
        const category = await CategoryOperations.getCategoryWithAttributes(externalCategoryId);
        setCategoryWithAttrs(category);
      } catch (error) {
        console.error('Failed to load category attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryAttributes();
  }, [externalCategoryId]);

  // Notify parent of form changes
  useEffect(() => {
    onFormChange?.(formData, isValid);
  }, [formData, isValid, onFormChange]);

  const onFormSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  const groupedAttributes = useMemo(() => {
    if (!categoryWithAttrs?.attributes) return [];

    // Group attributes by section or display order
    const groups = categoryWithAttrs.attributes.reduce((acc, attr) => {
      const section = attr.section || 'General';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(attr);
      return acc;
    }, {} as Record<string, AttributeDefinitionWithOptions[]>);

    // Sort attributes within each group by display_order
    Object.keys(groups).forEach(section => {
      groups[section].sort((a, b) => a.display_order - b.display_order);
    });

    return Object.entries(groups).map(([section, attributes]) => ({
      section,
      attributes
    }));
  }, [categoryWithAttrs]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!externalCategoryId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Select a category to see available fields</p>
      </div>
    );
  }

  if (!categoryWithAttrs?.attributes || categoryWithAttrs.attributes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No additional fields required for this category</p>
        {children}
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <FormProgressIndicator
          totalFields={categoryWithAttrs.attributes.length}
          filledFields={Object.keys(formData).filter(key => formData[key] !== undefined && formData[key] !== '').length}
        />

        {groupedAttributes.map(({ section, attributes }) => (
          <div key={section} className="space-y-6">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-medium text-gray-900">{section}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attributes.map(attribute => (
                <DynamicField
                  key={attribute.id}
                  attribute={attribute}
                  className={attribute.data_type === 'text' && attribute.validation_rules?.max_length > 100 ? 'md:col-span-2' : ''}
                />
              ))}
            </div>
          </div>
        ))}

        {children}
      </form>
    </FormProvider>
  );
}
```

### 2. Dynamic Field Component
- [ ] Create: `src/common/forms/DynamicField.tsx` (under 150 lines)

```tsx
// src/common/forms/DynamicField.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Select } from '@/primitives/select';
import { Checkbox } from '@/primitives/checkbox';
import { Switch } from '@/primitives/switch';
import { MultiSelect } from './MultiSelect';
import { DatePicker } from './DatePicker';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface Props {
  attribute: AttributeDefinitionWithOptions;
  className?: string;
}

export function DynamicField({ attribute, className }: Props) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const fieldValue = watch(attribute.name);
  const error = errors[attribute.name]?.message as string;

  const renderField = () => {
    const commonProps = {
      error,
      placeholder: attribute.help_text || `Enter ${attribute.display_label.toLowerCase()}`,
      ...register(attribute.name, {
        valueAsNumber: attribute.data_type === 'number'
      })
    };

    switch (attribute.data_type) {
      case 'text':
        if (attribute.validation_rules?.max_length > 100) {
          return (
            <Textarea
              {...commonProps}
              rows={4}
              maxLength={attribute.validation_rules.max_length}
            />
          );
        }
        return <Input {...commonProps} maxLength={attribute.validation_rules?.max_length} />;

      case 'email':
        return <Input {...commonProps} type="email" />;

      case 'url':
        return <Input {...commonProps} type="url" />;

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={attribute.validation_rules?.min_value}
            max={attribute.validation_rules?.max_value}
            step={attribute.validation_rules?.step || 'any'}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={fieldValue}
            onChange={(date) => setValue(attribute.name, date)}
            error={error}
            placeholder={attribute.help_text}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <Switch
              checked={fieldValue || false}
              onChange={(checked) => setValue(attribute.name, checked)}
            />
            <span className="text-sm text-gray-600">
              {attribute.help_text || 'Enable this option'}
            </span>
          </div>
        );

      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Select an option</option>
            {attribute.parsedOptions?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'multi_select':
        return (
          <MultiSelect
            options={attribute.parsedOptions || []}
            value={fieldValue || []}
            onChange={(values) => setValue(attribute.name, values)}
            error={error}
            placeholder={attribute.help_text}
          />
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {attribute.display_label}
        {attribute.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderField()}

      {attribute.help_text && !error && (
        <p className="mt-1 text-xs text-gray-500">{attribute.help_text}</p>
      )}

      {attribute.default_value && !fieldValue && (
        <p className="mt-1 text-xs text-blue-600">
          Default: {attribute.default_value}
        </p>
      )}

      {/* Character count for text fields */}
      {attribute.data_type === 'text' && attribute.validation_rules?.max_length && fieldValue && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {String(fieldValue).length} / {attribute.validation_rules.max_length}
        </p>
      )}
    </div>
  );
}
```

### 3. Form State Manager
- [ ] Create: `src/common/forms/FormStateManager.ts` (under 150 lines)

```typescript
// src/common/forms/FormStateManager.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormState {
  // Auto-save functionality
  autoSaveData: Record<string, any>;
  autoSaveKey: string | null;
  
  // Form progress tracking
  formProgress: Record<string, {
    totalFields: number;
    completedFields: number;
    lastSaved: Date;
  }>;

  // Field validation cache
  validationCache: Record<string, {
    isValid: boolean;
    errors: string[];
    lastValidated: Date;
  }>;

  // Actions
  setAutoSaveData: (key: string, data: any) => void;
  getAutoSaveData: (key: string) => any;
  clearAutoSaveData: (key: string) => void;
  
  updateFormProgress: (formId: string, total: number, completed: number) => void;
  getFormProgress: (formId: string) => { totalFields: number; completedFields: number; lastSaved: Date } | null;
  
  cacheValidation: (fieldKey: string, isValid: boolean, errors: string[]) => void;
  getValidationCache: (fieldKey: string) => { isValid: boolean; errors: string[] } | null;
  clearValidationCache: (fieldKey: string) => void;
}

export const useFormStateManager = create<FormState>()(
  persist(
    (set, get) => ({
      autoSaveData: {},
      autoSaveKey: null,
      formProgress: {},
      validationCache: {},

      setAutoSaveData: (key: string, data: any) => {
        set(state => ({
          autoSaveData: {
            ...state.autoSaveData,
            [key]: {
              ...data,
              savedAt: new Date().toISOString()
            }
          },
          autoSaveKey: key
        }));
      },

      getAutoSaveData: (key: string) => {
        const data = get().autoSaveData[key];
        if (!data) return null;
        
        // Check if data is too old (24 hours)
        const savedAt = new Date(data.savedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          get().clearAutoSaveData(key);
          return null;
        }
        
        return data;
      },

      clearAutoSaveData: (key: string) => {
        set(state => {
          const newAutoSaveData = { ...state.autoSaveData };
          delete newAutoSaveData[key];
          return {
            autoSaveData: newAutoSaveData,
            autoSaveKey: state.autoSaveKey === key ? null : state.autoSaveKey
          };
        });
      },

      updateFormProgress: (formId: string, total: number, completed: number) => {
        set(state => ({
          formProgress: {
            ...state.formProgress,
            [formId]: {
              totalFields: total,
              completedFields: completed,
              lastSaved: new Date()
            }
          }
        }));
      },

      getFormProgress: (formId: string) => {
        return get().formProgress[formId] || null;
      },

      cacheValidation: (fieldKey: string, isValid: boolean, errors: string[]) => {
        set(state => ({
          validationCache: {
            ...state.validationCache,
            [fieldKey]: {
              isValid,
              errors,
              lastValidated: new Date()
            }
          }
        }));
      },

      getValidationCache: (fieldKey: string) => {
        const cached = get().validationCache[fieldKey];
        if (!cached) return null;

        // Cache is valid for 5 minutes
        const minutesDiff = (new Date().getTime() - cached.lastValidated.getTime()) / (1000 * 60);
        if (minutesDiff > 5) {
          get().clearValidationCache(fieldKey);
          return null;
        }

        return { isValid: cached.isValid, errors: cached.errors };
      },

      clearValidationCache: (fieldKey: string) => {
        set(state => {
          const newValidationCache = { ...state.validationCache };
          delete newValidationCache[fieldKey];
          return { validationCache: newValidationCache };
        });
      }
    }),
    {
      name: 'form-state-storage',
      partialize: (state) => ({
        autoSaveData: state.autoSaveData,
        formProgress: state.formProgress
      })
    }
  )
);

// Form utilities
export class FormUtils {
  static generateFormKey(type: string, id?: string): string {
    return `${type}-${id || 'new'}-${Date.now()}`;
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  static calculateCompletionPercentage(
    totalFields: number,
    completedFields: number
  ): number {
    if (totalFields === 0) return 100;
    return Math.round((completedFields / totalFields) * 100);
  }

  static validateFieldValue(
    value: any,
    attribute: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (attribute.is_required && (!value || value === '')) {
      errors.push(`${attribute.display_label} is required`);
    }

    if (value && attribute.validation_rules) {
      const rules = attribute.validation_rules;

      switch (attribute.data_type) {
        case 'text':
        case 'email':
        case 'url':
          if (rules.min_length && String(value).length < rules.min_length) {
            errors.push(`Minimum length is ${rules.min_length} characters`);
          }
          if (rules.max_length && String(value).length > rules.max_length) {
            errors.push(`Maximum length is ${rules.max_length} characters`);
          }
          if (attribute.data_type === 'email' && !value.includes('@')) {
            errors.push('Please enter a valid email address');
          }
          if (attribute.data_type === 'url' && !value.startsWith('http')) {
            errors.push('Please enter a valid URL');
          }
          break;

        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push('Please enter a valid number');
          } else {
            if (rules.min_value !== undefined && numValue < rules.min_value) {
              errors.push(`Minimum value is ${rules.min_value}`);
            }
            if (rules.max_value !== undefined && numValue > rules.max_value) {
              errors.push(`Maximum value is ${rules.max_value}`);
            }
          }
          break;

        case 'multi_select':
          if (rules.min_selections && Array.isArray(value) && value.length < rules.min_selections) {
            errors.push(`Please select at least ${rules.min_selections} option${rules.min_selections > 1 ? 's' : ''}`);
          }
          if (rules.max_selections && Array.isArray(value) && value.length > rules.max_selections) {
            errors.push(`Please select no more than ${rules.max_selections} option${rules.max_selections > 1 ? 's' : ''}`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## Success Criteria
- [ ] Dynamic form engine renders forms based on category attributes
- [ ] Form state management with auto-save functionality
- [ ] Field validation works for all attribute types
- [ ] Form progress tracking implemented
- [ ] Robust error handling and user feedback
- [ ] All files under 150 lines with proper imports 