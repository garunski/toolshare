# Attribute Mapping System

## External Attribute to Internal Field Mapping

### 1. Attribute Mapping Engine
- [ ] Create: `src/common/operations/attributeMappingEngine.ts` (under 150 lines)

```typescript
// src/common/operations/attributeMappingEngine.ts
import { supabase } from '@/common/supabase';

interface AttributeMapping {
  external_category_id: number;
  external_attribute: string;
  internal_field: string;
  data_type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  is_required: boolean;
  validation_rules?: Record<string, any>;
  default_value?: string;
}

export class AttributeMappingEngine {
  
  /**
   * Get attribute mappings for category
   */
  static async getCategoryAttributeMappings(externalCategoryId: number): Promise<AttributeMapping[]> {
    const { data } = await supabase
      .from('attribute_mappings')
      .select('*')
      .eq('external_category_id', externalCategoryId)
      .eq('is_active', true);
    
    return data || [];
  }

  /**
   * Create or update attribute mapping
   */
  static async createMapping(mapping: Omit<AttributeMapping, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('attribute_mappings')
        .upsert({
          external_category_id: mapping.external_category_id,
          external_attribute: mapping.external_attribute,
          internal_field: mapping.internal_field,
          data_type: mapping.data_type,
          is_required: mapping.is_required,
          validation_rules: mapping.validation_rules,
          default_value: mapping.default_value,
          last_updated: new Date().toISOString()
        });
      
      return error ? { success: false, error: error.message } : { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-generate mappings for category
   */
  static async generateMappingsForCategory(externalCategoryId: number): Promise<AttributeMapping[]> {
    // Get category path to determine likely attributes
    const { data: category } = await supabase
      .from('external_product_taxonomy')
      .select('category_path, level')
      .eq('external_id', externalCategoryId)
      .single();
    
    if (!category) return [];
    
    const mappings: AttributeMapping[] = [];
    const categoryPath = category.category_path.toLowerCase();
    
    // Common mappings for all categories
    mappings.push(
      { external_category_id: externalCategoryId, external_attribute: 'brand', internal_field: 'brand', data_type: 'text', is_required: false },
      { external_category_id: externalCategoryId, external_attribute: 'model', internal_field: 'model', data_type: 'text', is_required: false },
      { external_category_id: externalCategoryId, external_attribute: 'condition', internal_field: 'condition', data_type: 'select', is_required: true }
    );
    
    // Category-specific mappings
    if (categoryPath.includes('tool') || categoryPath.includes('hardware')) {
      mappings.push(
        { external_category_id: externalCategoryId, external_attribute: 'power_source', internal_field: 'power_source', data_type: 'select', is_required: false },
        { external_category_id: externalCategoryId, external_attribute: 'warranty_period', internal_field: 'warranty_period', data_type: 'text', is_required: false }
      );
    }
    
    if (categoryPath.includes('electronic') || categoryPath.includes('appliance')) {
      mappings.push(
        { external_category_id: externalCategoryId, external_attribute: 'voltage', internal_field: 'voltage', data_type: 'number', is_required: false },
        { external_category_id: externalCategoryId, external_attribute: 'energy_rating', internal_field: 'energy_rating', data_type: 'select', is_required: false }
      );
    }
    
    return mappings;
  }

  /**
   * Validate mapped attributes
   */
  static validateMappedData(mappings: AttributeMapping[], data: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    processedData: Record<string, any>;
  } {
    const errors: string[] = [];
    const processedData: Record<string, any> = {};
    
    mappings.forEach(mapping => {
      const value = data[mapping.external_attribute];
      
      // Check required fields
      if (mapping.is_required && (value === undefined || value === null || value === '')) {
        errors.push(`Required field "${mapping.external_attribute}" is missing`);
        return;
      }
      
      // Skip empty optional fields
      if (!value && !mapping.is_required) return;
      
      // Type validation and conversion
      try {
        const converted = this.convertValue(value, mapping.data_type);
        processedData[mapping.internal_field] = converted;
      } catch (error) {
        errors.push(`Invalid ${mapping.data_type} value for "${mapping.external_attribute}": ${value}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      processedData
    };
  }

  /**
   * Convert value to appropriate data type
   */
  private static convertValue(value: any, dataType: string): any {
    switch (dataType) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      case 'boolean':
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase());
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        return date.toISOString();
      default:
        return String(value);
    }
  }
}
```

### 2. Mapping Management Interface
- [ ] Create: `src/app/admin/mappings/page.tsx` (under 150 lines)

```tsx
// src/app/admin/mappings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/primitives/button';
import { Heading } from '@/primitives/heading';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { AttributeMappingTable } from './components/AttributeMappingTable';
import { MappingFormModal } from './components/MappingFormModal';
import { AttributeMappingEngine } from '@/common/operations/attributeMappingEngine';

export default function AdminAttributeMappingsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadMappings = async (categoryId: number) => {
    setLoading(true);
    try {
      const categoryMappings = await AttributeMappingEngine.getCategoryAttributeMappings(categoryId);
      setMappings(categoryMappings);
    } catch (error) {
      console.error('Failed to load mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMappings = async () => {
    if (!selectedCategoryId) return;
    
    try {
      const generated = await AttributeMappingEngine.generateMappingsForCategory(selectedCategoryId);
      
      for (const mapping of generated) {
        await AttributeMappingEngine.createMapping(mapping);
      }
      
      await loadMappings(selectedCategoryId);
    } catch (error) {
      console.error('Failed to generate mappings:', error);
    }
  };

  return (
    <AdminProtection>
      <div className="p-6 space-y-8">
        <div>
          <Heading level={1}>Attribute Mappings</Heading>
          <p className="text-gray-600 mt-1">
            Map external attributes to internal fields
          </p>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <Heading level={2} className="mb-4">Select Category</Heading>
          {/* Category selector would go here */}
          
          {selectedCategoryId && (
            <div className="flex space-x-4 mt-4">
              <Button onClick={handleGenerateMappings}>
                Generate Auto-Mappings
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                Create Custom Mapping
              </Button>
            </div>
          )}
        </div>

        {/* Mappings Table */}
        {selectedCategoryId && (
          <AttributeMappingTable
            mappings={mappings}
            loading={loading}
            onRefresh={() => loadMappings(selectedCategoryId)}
          />
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <MappingFormModal
            categoryId={selectedCategoryId}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              if (selectedCategoryId) loadMappings(selectedCategoryId);
            }}
          />
        )}
      </div>
    </AdminProtection>
  );
}
```

### 3. Field Standardization Engine
- [ ] Create: `src/common/operations/fieldStandardizationEngine.ts` (under 150 lines)

```typescript
// src/common/operations/fieldStandardizationEngine.ts

interface StandardField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select';
  required: boolean;
  validation?: Record<string, any>;
  options?: string[];
}

export class FieldStandardizationEngine {
  
  /**
   * Get standard field definitions
   */
  static getStandardFields(): Record<string, StandardField> {
    return {
      'brand': {
        name: 'Brand',
        type: 'text',
        required: false,
        validation: { maxLength: 100 }
      },
      'model': {
        name: 'Model',
        type: 'text',
        required: false,
        validation: { maxLength: 100 }
      },
      'condition': {
        name: 'Condition',
        type: 'select',
        required: true,
        options: ['excellent', 'good', 'fair', 'poor']
      },
      'color': {
        name: 'Color',
        type: 'text',
        required: false,
        validation: { maxLength: 50 }
      },
      'material': {
        name: 'Material',
        type: 'text',
        required: false,
        validation: { maxLength: 100 }
      },
      'dimensions': {
        name: 'Dimensions',
        type: 'text',
        required: false,
        validation: { pattern: '^\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?.*$' }
      },
      'weight': {
        name: 'Weight',
        type: 'number',
        required: false,
        validation: { minimum: 0 }
      },
      'power_source': {
        name: 'Power Source',
        type: 'select',
        required: false,
        options: ['battery', 'electric', 'manual', 'gas', 'solar']
      },
      'warranty_period': {
        name: 'Warranty Period',
        type: 'text',
        required: false,
        validation: { maxLength: 50 }
      },
      'energy_rating': {
        name: 'Energy Rating',
        type: 'select',
        required: false,
        options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
      }
    };
  }

  /**
   * Standardize field data
   */
  static standardizeData(data: Record<string, any>): Record<string, any> {
    const standardFields = this.getStandardFields();
    const standardized: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      const fieldDef = standardFields[key];
      if (!fieldDef) {
        // Keep non-standard fields as-is
        standardized[key] = value;
        return;
      }
      
      // Apply standardization
      try {
        standardized[key] = this.standardizeValue(value, fieldDef);
      } catch (error) {
        // Keep original value if standardization fails
        standardized[key] = value;
      }
    });
    
    return standardized;
  }

  /**
   * Standardize individual value
   */
  private static standardizeValue(value: any, fieldDef: StandardField): any {
    if (!value) return value;
    
    switch (fieldDef.type) {
      case 'text':
        return String(value).trim();
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? value : num;
      case 'boolean':
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase());
      case 'select':
        const stringValue = String(value).toLowerCase();
        const match = fieldDef.options?.find(option => option.toLowerCase() === stringValue);
        return match || value;
      default:
        return value;
    }
  }
}
```

### 4. Implementation Checklist
- [ ] Attribute mapping engine with category-specific rules
- [ ] Field standardization with validation
- [ ] Admin interface for mapping management
- [ ] Auto-mapping generation for common attributes
- [ ] Data type conversion and validation
- [ ] Mapping conflict resolution
- [ ] Performance optimization for large mappings
- [ ] Import/export mapping configurations
- [ ] Version control for mapping changes
- [ ] Analytics on mapping usage and effectiveness 