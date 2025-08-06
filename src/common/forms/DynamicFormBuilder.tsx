'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { DynamicField } from './DynamicField';
import { FormProgressIndicator } from './FormProgressIndicator';
import { DynamicValidationEngine, type AttributeDefinitionWithOptions } from './DynamicValidationEngine';
import { useFormStateManager, FormUtils } from './FormStateManager';

interface Props {
  attributes: AttributeDefinitionWithOptions[];
  initialValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
  onFormChange?: (data: any, isValid: boolean) => void;
  children?: React.ReactNode;
  formKey?: string;
}

export function DynamicFormBuilder({
  attributes,
  initialValues = {},
  onSubmit,
  onFormChange,
  children,
  formKey
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { updateFormProgress } = useFormStateManager();

  // Generate dynamic validation schema
  const validationSchema = useMemo(() => {
    if (!attributes || attributes.length === 0) {
      return z.object({});
    }

    const validationEngine = new DynamicValidationEngine(attributes);
    return validationEngine.generateZodSchema();
  }, [attributes]);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
    mode: 'onChange'
  });

  const { handleSubmit, watch, formState: { isValid, errors } } = methods;
  const formData = watch();

  // Update form progress
  useEffect(() => {
    if (formKey && attributes.length > 0) {
      const filledFields = Object.keys(formData).filter(key => {
        const value = formData[key];
        return value !== undefined && value !== '' && value !== null && 
               (Array.isArray(value) ? value.length > 0 : true);
      }).length;
      
      updateFormProgress(formKey, attributes.length, filledFields);
    }
  }, [formData, attributes.length, formKey, updateFormProgress]);

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
    if (!attributes || attributes.length === 0) return [];

    // Group attributes by section or display order
    const groups = attributes.reduce((acc, attr) => {
      const section = 'General'; // Could be extended to support sections
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
  }, [attributes]);

  if (!attributes || attributes.length === 0) {
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
          totalFields={attributes.length}
          filledFields={Object.keys(formData).filter(key => {
            const value = formData[key];
            return value !== undefined && value !== '' && value !== null && 
                   (Array.isArray(value) ? value.length > 0 : true);
          }).length}
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