# Attribute Operations Implementation

## Dynamic Attribute Definition Management

### 1. Attribute Types Definition
- [ ] Create: `src/types/attributes.ts` (under 150 lines)

```typescript
// src/types/attributes.ts
import { Database } from './supabase';

export type AttributeDefinition = Database['public']['Tables']['attribute_definitions']['Row'];
export type AttributeDefinitionInsert = Database['public']['Tables']['attribute_definitions']['Insert'];
export type AttributeDefinitionUpdate = Database['public']['Tables']['attribute_definitions']['Update'];

export type AttributeDataType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select' | 'url' | 'email';

export interface AttributeValidationRules {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  required?: boolean;
  custom?: string;
}

export interface AttributeOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface AttributeDefinitionWithOptions extends AttributeDefinition {
  parsedOptions?: AttributeOption[];
  parsedValidationRules?: AttributeValidationRules;
}

export interface AttributeCreationRequest {
  name: string;
  display_label: string;
  description?: string;
  data_type: AttributeDataType;
  is_required?: boolean;
  validation_rules?: AttributeValidationRules;
  default_value?: string;
  options?: AttributeOption[];
  display_order?: number;
  is_searchable?: boolean;
  is_filterable?: boolean;
  help_text?: string;
}

export interface AttributeUpdateRequest extends Partial<AttributeCreationRequest> {
  id: string;
}

export interface AttributeValue {
  attributeName: string;
  value: any;
  displayValue: string;
  dataType: AttributeDataType;
}
```

### 2. Attribute Operations
- [ ] Create: `src/common/operations/attributeOperations.ts` (under 150 lines)

```typescript
// src/common/operations/attributeOperations.ts
import { supabase } from '@/common/supabase';
import type {
  AttributeDefinition,
  AttributeDefinitionWithOptions,
  AttributeCreationRequest,
  AttributeUpdateRequest,
  AttributeOption,
  AttributeValidationRules
} from '@/types/attributes';

export class AttributeOperations {
  
  /**
   * Get all attribute definitions
   */
  static async getAllAttributes(): Promise<AttributeDefinitionWithOptions[]> {
    const { data, error } = await supabase
      .from('attribute_definitions')
      .select('*')
      .order('display_order', { ascending: true })
      .order('display_label', { ascending: true });

    if (error) throw new Error(`Failed to fetch attributes: ${error.message}`);

    return data.map(attr => this.parseAttributeDefinition(attr));
  }

  /**
   * Get attribute definition by ID
   */
  static async getAttributeById(attributeId: string): Promise<AttributeDefinitionWithOptions | null> {
    const { data, error } = await supabase
      .from('attribute_definitions')
      .select('*')
      .eq('id', attributeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch attribute: ${error.message}`);
    }

    return this.parseAttributeDefinition(data);
  }

  /**
   * Get attributes by data type
   */
  static async getAttributesByType(dataType: string): Promise<AttributeDefinitionWithOptions[]> {
    const { data, error } = await supabase
      .from('attribute_definitions')
      .select('*')
      .eq('data_type', dataType)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch attributes by type: ${error.message}`);

    return data.map(attr => this.parseAttributeDefinition(attr));
  }

  /**
   * Create new attribute definition
   */
  static async createAttribute(attributeData: AttributeCreationRequest): Promise<AttributeDefinition> {
    const { data, error } = await supabase
      .from('attribute_definitions')
      .insert({
        name: attributeData.name,
        display_label: attributeData.display_label,
        description: attributeData.description,
        data_type: attributeData.data_type,
        is_required: attributeData.is_required || false,
        validation_rules: attributeData.validation_rules || {},
        default_value: attributeData.default_value,
        options: attributeData.options ? { options: attributeData.options } : null,
        display_order: attributeData.display_order || 0,
        is_searchable: attributeData.is_searchable || false,
        is_filterable: attributeData.is_filterable || false,
        help_text: attributeData.help_text
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create attribute: ${error.message}`);

    return data;
  }

  /**
   * Update existing attribute definition
   */
  static async updateAttribute(updateData: AttributeUpdateRequest): Promise<AttributeDefinition> {
    const { id, options, validation_rules, ...updates } = updateData;
    
    const processedUpdates = {
      ...updates,
      ...(options && { options: { options } }),
      ...(validation_rules && { validation_rules })
    };

    const { data, error } = await supabase
      .from('attribute_definitions')
      .update(processedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update attribute: ${error.message}`);

    return data;
  }

  /**
   * Delete attribute definition
   */
  static async deleteAttribute(attributeId: string): Promise<void> {
    // Check if attribute is used in category_attributes
    const { data: categoryLinks } = await supabase
      .from('category_attributes')
      .select('id')
      .eq('attribute_definition_id', attributeId);

    if (categoryLinks && categoryLinks.length > 0) {
      throw new Error('Cannot delete attribute that is used by categories');
    }

    const { error } = await supabase
      .from('attribute_definitions')
      .delete()
      .eq('id', attributeId);

    if (error) throw new Error(`Failed to delete attribute: ${error.message}`);
  }

  /**
   * Validate attribute value against definition
   */
  static validateAttributeValue(
    value: any, 
    attribute: AttributeDefinitionWithOptions
  ): { isValid: boolean; error?: string } {
    const rules = attribute.parsedValidationRules || {};
    
    // Check required
    if (attribute.is_required && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: `${attribute.display_label} is required` };
    }

    // Skip validation if empty and not required
    if (!value) return { isValid: true };

    // Type-specific validation
    switch (attribute.data_type) {
      case 'text':
        return this.validateTextValue(value, rules, attribute.display_label);
      case 'number':
        return this.validateNumberValue(value, rules, attribute.display_label);
      case 'email':
        return this.validateEmailValue(value, attribute.display_label);
      case 'url':
        return this.validateUrlValue(value, attribute.display_label);
      case 'select':
        return this.validateSelectValue(value, attribute.parsedOptions || [], attribute.display_label);
      case 'multi_select':
        return this.validateMultiSelectValue(value, attribute.parsedOptions || [], attribute.display_label);
      case 'date':
        return this.validateDateValue(value, attribute.display_label);
      case 'boolean':
        return this.validateBooleanValue(value, attribute.display_label);
      default:
        return { isValid: true };
    }
  }

  /**
   * Parse attribute definition with typed options and validation rules
   */
  private static parseAttributeDefinition(attr: AttributeDefinition): AttributeDefinitionWithOptions {
    return {
      ...attr,
      parsedOptions: attr.options?.options || [],
      parsedValidationRules: attr.validation_rules || {}
    };
  }

  /**
   * Validation helpers for different data types
   */
  private static validateTextValue(value: string, rules: AttributeValidationRules, label: string) {
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, error: `${label} must be at least ${rules.minLength} characters` };
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, error: `${label} must be less than ${rules.maxLength} characters` };
    }
    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      return { isValid: false, error: `${label} format is invalid` };
    }
    return { isValid: true };
  }

  private static validateNumberValue(value: number, rules: AttributeValidationRules, label: string) {
    const num = Number(value);
    if (isNaN(num)) {
      return { isValid: false, error: `${label} must be a valid number` };
    }
    if (rules.minimum !== undefined && num < rules.minimum) {
      return { isValid: false, error: `${label} must be at least ${rules.minimum}` };
    }
    if (rules.maximum !== undefined && num > rules.maximum) {
      return { isValid: false, error: `${label} must be at most ${rules.maximum}` };
    }
    return { isValid: true };
  }

  private static validateEmailValue(value: string, label: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: `${label} must be a valid email address` };
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

  private static validateSelectValue(value: string, options: AttributeOption[], label: string) {
    if (!options.some(opt => opt.value === value)) {
      return { isValid: false, error: `${label} must be one of the available options` };
    }
    return { isValid: true };
  }

  private static validateMultiSelectValue(values: string[], options: AttributeOption[], label: string) {
    if (!Array.isArray(values)) {
      return { isValid: false, error: `${label} must be an array of values` };
    }
    const validValues = options.map(opt => opt.value);
    const invalidValues = values.filter(val => !validValues.includes(val));
    if (invalidValues.length > 0) {
      return { isValid: false, error: `${label} contains invalid options: ${invalidValues.join(', ')}` };
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
    if (typeof value !== 'boolean') {
      return { isValid: false, error: `${label} must be true or false` };
    }
    return { isValid: true };
  }
}
```

### 3. Attribute Validation
- [ ] Create: `src/common/validators/attributeValidator.ts` (under 150 lines)

```typescript
// src/common/validators/attributeValidator.ts
import { z } from 'zod';

const attributeDataTypeSchema = z.enum(['text', 'number', 'boolean', 'date', 'select', 'multi_select', 'url', 'email']);

const attributeOptionSchema = z.object({
  value: z.string().min(1, 'Option value is required'),
  label: z.string().min(1, 'Option label is required'),
  color: z.string().optional(),
  icon: z.string().optional()
});

const validationRulesSchema = z.object({
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  pattern: z.string().optional(),
  required: z.boolean().optional(),
  custom: z.string().optional()
}).refine(data => {
  if (data.minLength !== undefined && data.maxLength !== undefined) {
    return data.minLength <= data.maxLength;
  }
  return true;
}, { message: 'Minimum length must be less than or equal to maximum length' })
.refine(data => {
  if (data.minimum !== undefined && data.maximum !== undefined) {
    return data.minimum <= data.maximum;
  }
  return true;
}, { message: 'Minimum value must be less than or equal to maximum value' });

export const attributeCreationSchema = z.object({
  name: z.string()
    .min(1, 'Attribute name is required')
    .max(100, 'Attribute name must be less than 100 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Attribute name must start with letter and contain only lowercase letters, numbers, and underscores'),
  
  display_label: z.string()
    .min(1, 'Display label is required')
    .max(100, 'Display label must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  data_type: attributeDataTypeSchema,
  
  is_required: z.boolean().optional(),
  
  validation_rules: validationRulesSchema.optional(),
  
  default_value: z.string()
    .max(200, 'Default value must be less than 200 characters')
    .optional(),
  
  options: z.array(attributeOptionSchema)
    .min(1, 'At least one option is required for select types')
    .optional(),
  
  display_order: z.number()
    .min(0, 'Display order must be non-negative')
    .max(9999, 'Display order too large')
    .optional(),
  
  is_searchable: z.boolean().optional(),
  is_filterable: z.boolean().optional(),
  
  help_text: z.string()
    .max(300, 'Help text must be less than 300 characters')
    .optional()
}).refine(data => {
  // Options required for select types
  if ((data.data_type === 'select' || data.data_type === 'multi_select') && !data.options?.length) {
    return false;
  }
  return true;
}, {
  message: 'Options are required for select and multi-select types',
  path: ['options']
});

export const attributeUpdateSchema = attributeCreationSchema
  .partial()
  .extend({
    id: z.string().uuid('Invalid attribute ID')
  });

// Type inference
export type AttributeCreationInput = z.infer<typeof attributeCreationSchema>;
export type AttributeUpdateInput = z.infer<typeof attributeUpdateSchema>;

// Validation helper functions
export class AttributeValidator {
  static validateAttributeCreation(data: unknown): AttributeCreationInput {
    return attributeCreationSchema.parse(data);
  }

  static validateAttributeUpdate(data: unknown): AttributeUpdateInput {
    return attributeUpdateSchema.parse(data);
  }

  /**
   * Check if attribute name is available
   */
  static async isNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    const { supabase } = await import('@/common/supabase');
    
    let query = supabase
      .from('attribute_definitions')
      .select('id')
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return !data || data.length === 0;
  }

  /**
   * Generate attribute name from display label
   */
  static generateName(displayLabel: string): string {
    return displayLabel
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Validate regex pattern
   */
  static validateRegexPattern(pattern: string): boolean {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }
}
```

### 4. Attribute Hooks
- [ ] Create: `src/common/hooks/useAttributes.ts` (under 150 lines)

```typescript
// src/common/hooks/useAttributes.ts
import { useState, useEffect, useCallback } from 'react';
import { AttributeOperations } from '@/common/operations/attributeOperations';
import type { 
  AttributeDefinition,
  AttributeDefinitionWithOptions,
  AttributeCreationRequest,
  AttributeUpdateRequest 
} from '@/types/attributes';

interface UseAttributesReturn {
  attributes: AttributeDefinitionWithOptions[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAttribute: (data: AttributeCreationRequest) => Promise<AttributeDefinition>;
  updateAttribute: (data: AttributeUpdateRequest) => Promise<AttributeDefinition>;
  deleteAttribute: (id: string) => Promise<void>;
}

export function useAttributes(): UseAttributesReturn {
  const [attributes, setAttributes] = useState<AttributeDefinitionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AttributeOperations.getAllAttributes();
      setAttributes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attributes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const createAttribute = useCallback(async (data: AttributeCreationRequest): Promise<AttributeDefinition> => {
    try {
      const newAttribute = await AttributeOperations.createAttribute(data);
      await fetchAttributes(); // Refresh list
      return newAttribute;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create attribute';
      setError(message);
      throw new Error(message);
    }
  }, [fetchAttributes]);

  const updateAttribute = useCallback(async (data: AttributeUpdateRequest): Promise<AttributeDefinition> => {
    try {
      const updatedAttribute = await AttributeOperations.updateAttribute(data);
      await fetchAttributes(); // Refresh list
      return updatedAttribute;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update attribute';
      setError(message);
      throw new Error(message);
    }
  }, [fetchAttributes]);

  const deleteAttribute = useCallback(async (id: string): Promise<void> => {
    try {
      await AttributeOperations.deleteAttribute(id);
      await fetchAttributes(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete attribute';
      setError(message);
      throw new Error(message);
    }
  }, [fetchAttributes]);

  return {
    attributes,
    loading,
    error,
    refetch: fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  };
}

interface UseAttributeReturn {
  attribute: AttributeDefinitionWithOptions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAttribute(attributeId: string | null): UseAttributeReturn {
  const [attribute, setAttribute] = useState<AttributeDefinitionWithOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttribute = useCallback(async () => {
    if (!attributeId) {
      setAttribute(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AttributeOperations.getAttributeById(attributeId);
      setAttribute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attribute');
    } finally {
      setLoading(false);
    }
  }, [attributeId]);

  useEffect(() => {
    fetchAttribute();
  }, [fetchAttribute]);

  return {
    attribute,
    loading,
    error,
    refetch: fetchAttribute,
  };
}
```

## Success Criteria
- [ ] All attribute operations work correctly
- [ ] Validation handles all data types properly
- [ ] Attribute hooks provide reactive data management
- [ ] Complex validation rules supported
- [ ] Performance optimized for large attribute sets
- [ ] All files under 150 lines with proper imports 