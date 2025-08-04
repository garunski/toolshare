# Attribute Management Interface

## Admin Attribute Definition Management

### 1. Attribute Management Page
- [ ] Create: `src/app/admin/attributes/page.tsx` (under 150 lines)

```tsx
// src/app/admin/attributes/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Heading } from '@/primitives/heading';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { AttributeListView } from './components/AttributeListView';
import { AttributeFormModal } from './components/AttributeFormModal';
import { AttributePreviewModal } from './components/AttributePreviewModal';
import { useAttributes } from '@/common/hooks/useAttributes';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

export default function AdminAttributesPage() {
  const { attributes, loading, error, refetch } = useAttributes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeDefinitionWithOptions | null>(null);
  const [previewingAttribute, setPreviewingAttribute] = useState<AttributeDefinitionWithOptions | null>(null);

  const handleCreateAttribute = () => {
    setEditingAttribute(null);
    setShowCreateModal(true);
  };

  const handleEditAttribute = (attribute: AttributeDefinitionWithOptions) => {
    setEditingAttribute(attribute);
    setShowCreateModal(true);
  };

  const handlePreviewAttribute = (attribute: AttributeDefinitionWithOptions) => {
    setPreviewingAttribute(attribute);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingAttribute(null);
    refetch();
  };

  const handlePreviewClose = () => {
    setPreviewingAttribute(null);
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  if (error) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error loading attributes: {error}</p>
            <Button onClick={refetch} className="mt-2">Retry</Button>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Heading level={1}>Attribute Management</Heading>
          <Button onClick={handleCreateAttribute}>
            Create Attribute
          </Button>
        </div>

        <AttributeListView
          attributes={attributes}
          onEdit={handleEditAttribute}
          onPreview={handlePreviewAttribute}
          onRefresh={refetch}
        />

        {showCreateModal && (
          <AttributeFormModal
            attribute={editingAttribute}
            onClose={handleModalClose}
            onSuccess={handleModalClose}
          />
        )}

        {previewingAttribute && (
          <AttributePreviewModal
            attribute={previewingAttribute}
            onClose={handlePreviewClose}
          />
        )}
      </div>
    </AdminProtection>
  );
}
```

### 2. Attribute List View Component
- [ ] Create: `src/app/admin/attributes/components/AttributeListView.tsx` (under 150 lines)

```tsx
// src/app/admin/attributes/components/AttributeListView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Input } from '@/primitives/input';
import { Select } from '@/primitives/select';
import { PencilIcon, EyeIcon, TrashIcon, SearchIcon } from '@heroicons/react/24/outline';
import { AttributeOperations } from '@/common/operations/attributeOperations';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface Props {
  attributes: AttributeDefinitionWithOptions[];
  onEdit: (attribute: AttributeDefinitionWithOptions) => void;
  onPreview: (attribute: AttributeDefinitionWithOptions) => void;
  onRefresh: () => void;
}

const DATA_TYPE_COLORS = {
  text: 'bg-blue-100 text-blue-800',
  number: 'bg-green-100 text-green-800',
  boolean: 'bg-purple-100 text-purple-800',
  date: 'bg-yellow-100 text-yellow-800',
  select: 'bg-orange-100 text-orange-800',
  multi_select: 'bg-red-100 text-red-800',
  url: 'bg-indigo-100 text-indigo-800',
  email: 'bg-pink-100 text-pink-800'
};

export function AttributeListView({ attributes, onEdit, onPreview, onRefresh }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (attribute: AttributeDefinitionWithOptions) => {
    if (!confirm(`Are you sure you want to delete "${attribute.display_label}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(attribute.id);
    try {
      await AttributeOperations.deleteAttribute(attribute.id);
      onRefresh();
    } catch (error) {
      alert(`Failed to delete attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAttributes = attributes.filter(attr => {
    const matchesSearch = !searchTerm || 
      attr.display_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || attr.data_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (attributes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-4">
          <SearchIcon className="h-12 w-12 mx-auto text-gray-300" />
        </div>
        <p className="text-gray-500">No attributes found. Create your first attribute to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>
          <div className="w-48">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="multi_select">Multi Select</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttributes.map(attribute => (
          <div key={attribute.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {attribute.display_label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{attribute.name}</p>
                </div>
                <Badge className={DATA_TYPE_COLORS[attribute.data_type as keyof typeof DATA_TYPE_COLORS]}>
                  {attribute.data_type}
                </Badge>
              </div>

              {attribute.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {attribute.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {attribute.is_required && (
                  <Badge variant="destructive" size="sm">Required</Badge>
                )}
                {attribute.is_searchable && (
                  <Badge variant="secondary" size="sm">Searchable</Badge>
                )}
                {attribute.is_filterable && (
                  <Badge variant="secondary" size="sm">Filterable</Badge>
                )}
                {attribute.parsedOptions && attribute.parsedOptions.length > 0 && (
                  <Badge variant="outline" size="sm">
                    {attribute.parsedOptions.length} options
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Order: {attribute.display_order}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPreview(attribute)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(attribute)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(attribute)}
                    disabled={deletingId === attribute.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === attribute.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAttributes.length === 0 && attributes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No attributes match your search criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => { setSearchTerm(''); setFilterType(''); }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 3. Attribute Form Modal
- [ ] Create: `src/app/admin/attributes/components/AttributeFormModal.tsx` (under 150 lines)

```tsx
// src/app/admin/attributes/components/AttributeFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/primitives/dialog';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Select } from '@/primitives/select';
import { Switch } from '@/primitives/switch';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AttributeValidator, attributeCreationSchema } from '@/common/validators/attributeValidator';
import { AttributeOperations } from '@/common/operations/attributeOperations';
import type { AttributeDefinitionWithOptions, AttributeCreationRequest, AttributeOption } from '@/types/attributes';
import type { z } from 'zod';

interface Props {
  attribute?: AttributeDefinitionWithOptions | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = z.infer<typeof attributeCreationSchema>;

export function AttributeFormModal({ attribute, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control
  } = useForm<FormData>({
    resolver: zodResolver(attributeCreationSchema),
    defaultValues: {
      name: attribute?.name || '',
      display_label: attribute?.display_label || '',
      description: attribute?.description || '',
      data_type: attribute?.data_type || 'text',
      is_required: attribute?.is_required || false,
      validation_rules: attribute?.parsedValidationRules || {},
      default_value: attribute?.default_value || '',
      options: attribute?.parsedOptions || [],
      display_order: attribute?.display_order || 0,
      is_searchable: attribute?.is_searchable || false,
      is_filterable: attribute?.is_filterable || false,
      help_text: attribute?.help_text || ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  const watchedName = watch('name');
  const watchedDisplayLabel = watch('display_label');
  const watchedDataType = watch('data_type');

  // Auto-generate name from display label
  useEffect(() => {
    if (!attribute && watchedDisplayLabel) {
      const generatedName = AttributeValidator.generateName(watchedDisplayLabel);
      setValue('name', generatedName);
    }
  }, [watchedDisplayLabel, setValue, attribute]);

  // Check name availability
  useEffect(() => {
    if (watchedName && watchedName.length > 1) {
      const checkName = async () => {
        const available = await AttributeValidator.isNameAvailable(
          watchedName,
          attribute?.id
        );
        setNameAvailable(available);
      };
      checkName();
    }
  }, [watchedName, attribute?.id]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (attribute) {
        await AttributeOperations.updateAttribute({ id: attribute.id, ...data });
      } else {
        await AttributeOperations.createAttribute(data);
      }
      onSuccess();
    } catch (error) {
      alert(`Failed to ${attribute ? 'update' : 'create'} attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    append({ value: '', label: '' });
  };

  const requiresOptions = watchedDataType === 'select' || watchedDataType === 'multi_select';

  return (
    <Dialog open onClose={onClose} size="xl">
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6">
          {attribute ? 'Edit Attribute' : 'Create Attribute'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Label *</label>
              <Input
                {...register('display_label')}
                placeholder="Brand Name"
                error={errors.display_label?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Internal Name *</label>
              <Input
                {...register('name')}
                placeholder="brand_name"
                error={errors.name?.message}
              />
              {nameAvailable === false && (
                <p className="text-sm text-red-600 mt-1">Name is already taken</p>
              )}
              {nameAvailable === true && (
                <p className="text-sm text-green-600 mt-1">Name is available</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              {...register('description')}
              placeholder="Attribute description"
              rows={3}
            />
          </div>

          {/* Data Type and Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Type *</label>
              <Select {...register('data_type')}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="select">Select (Single Choice)</option>
                <option value="multi_select">Multi Select</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <Input
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="9999"
              />
            </div>
          </div>

          {/* Options for Select Types */}
          {requiresOptions && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium">Options *</label>
                <Button type="button" size="sm" onClick={addOption}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <Input
                      {...register(`options.${index}.value` as const)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Input
                      {...register(`options.${index}.label` as const)}
                      placeholder="Display Label"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => remove(index)}
                      className="text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Value</label>
              <Input
                {...register('default_value')}
                placeholder="Default value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Help Text</label>
              <Input
                {...register('help_text')}
                placeholder="Help text for users"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Required Field</span>
                <p className="text-xs text-gray-500">Users must provide a value</p>
              </div>
              <Switch {...register('is_required')} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Searchable</span>
                <p className="text-xs text-gray-500">Include in search results</p>
              </div>
              <Switch {...register('is_searchable')} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Filterable</span>
                <p className="text-xs text-gray-500">Show in filter options</p>
              </div>
              <Switch {...register('is_filterable')} />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || nameAvailable === false}
            >
              {submitting ? 'Saving...' : (attribute ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
```

### 4. Attribute Preview Modal
- [ ] Create: `src/app/admin/attributes/components/AttributePreviewModal.tsx` (under 150 lines)

```tsx
// src/app/admin/attributes/components/AttributePreviewModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@/primitives/dialog';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Select } from '@/primitives/select';
import { Switch } from '@/primitives/switch';
import { Badge } from '@/primitives/badge';
import { AttributeOperations } from '@/common/operations/attributeOperations';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface Props {
  attribute: AttributeDefinitionWithOptions;
  onClose: () => void;
}

export function AttributePreviewModal({ attribute, onClose }: Props) {
  const [testValue, setTestValue] = useState<any>('');
  const [validationResult, setValidationResult] = useState<{isValid: boolean; error?: string} | null>(null);

  const handleTestValidation = () => {
    const result = AttributeOperations.validateAttributeValue(testValue, attribute);
    setValidationResult(result);
  };

  const renderFieldPreview = () => {
    const commonProps = {
      placeholder: attribute.help_text || `Enter ${attribute.display_label.toLowerCase()}`,
      disabled: true
    };

    switch (attribute.data_type) {
      case 'text':
      case 'email':
      case 'url':
        return <Input {...commonProps} />;
      
      case 'number':
        return <Input type="number" {...commonProps} />;
      
      case 'date':
        return <Input type="date" {...commonProps} />;
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch disabled />
            <span className="text-sm text-gray-600">True/False toggle</span>
          </div>
        );
      
      case 'select':
        return (
          <Select disabled>
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
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Multiple selection dropdown</p>
            <div className="flex flex-wrap gap-2">
              {attribute.parsedOptions?.slice(0, 3).map(option => (
                <Badge key={option.value} variant="outline">
                  {option.label}
                </Badge>
              ))}
              {(attribute.parsedOptions?.length || 0) > 3 && (
                <Badge variant="outline">+{(attribute.parsedOptions?.length || 0) - 3} more</Badge>
              )}
            </div>
          </div>
        );
      
      default:
        return <Input {...commonProps} />;
    }
  };

  const renderTestInput = () => {
    switch (attribute.data_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder={`Test ${attribute.display_label.toLowerCase()} value`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="Test number value"
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={testValue}
              onChange={setTestValue}
            />
            <span className="text-sm">Test boolean value</span>
          </div>
        );
      
      case 'select':
        return (
          <Select
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
          >
            <option value="">Select test value</option>
            {attribute.parsedOptions?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'multi_select':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">For testing, select multiple values as comma-separated:</p>
            <Input
              value={Array.isArray(testValue) ? testValue.join(', ') : testValue}
              onChange={(e) => setTestValue(e.target.value.split(', ').filter(v => v.trim()))}
              placeholder="value1, value2, value3"
            />
          </div>
        );
      
      default:
        return (
          <Input
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="Test value"
          />
        );
    }
  };

  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">
          Attribute Preview: {attribute.display_label}
        </h2>

        <div className="space-y-6">
          {/* Attribute Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Internal Name:</span> {attribute.name}
              </div>
              <div>
                <span className="font-medium">Data Type:</span>
                <Badge className="ml-2" variant="outline">{attribute.data_type}</Badge>
              </div>
              <div>
                <span className="font-medium">Required:</span> {attribute.is_required ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Display Order:</span> {attribute.display_order}
              </div>
            </div>
            
            {attribute.description && (
              <div className="mt-3">
                <span className="font-medium text-sm">Description:</span>
                <p className="text-sm text-gray-600 mt-1">{attribute.description}</p>
              </div>
            )}

            {attribute.help_text && (
              <div className="mt-3">
                <span className="font-medium text-sm">Help Text:</span>
                <p className="text-sm text-gray-600 mt-1">{attribute.help_text}</p>
              </div>
            )}

            {attribute.default_value && (
              <div className="mt-3">
                <span className="font-medium text-sm">Default Value:</span>
                <span className="text-sm text-gray-600 ml-2">{attribute.default_value}</span>
              </div>
            )}
          </div>

          {/* Field Preview */}
          <div>
            <h3 className="font-medium mb-3">How this field will appear:</h3>
            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                {attribute.display_label}
                {attribute.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderFieldPreview()}
              {attribute.help_text && (
                <p className="text-xs text-gray-500 mt-1">{attribute.help_text}</p>
              )}
            </div>
          </div>

          {/* Validation Testing */}
          <div>
            <h3 className="font-medium mb-3">Test Validation:</h3>
            <div className="space-y-3">
              {renderTestInput()}
              
              <div className="flex space-x-3">
                <Button onClick={handleTestValidation}>
                  Test Validation
                </Button>
                <Button variant="outline" onClick={() => { setTestValue(''); setValidationResult(null); }}>
                  Clear
                </Button>
              </div>

              {validationResult && (
                <div className={`p-3 rounded-md ${validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {validationResult.isValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                  {validationResult.error && (
                    <p className="text-sm text-red-700 mt-1">{validationResult.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
}
```

## Success Criteria
- [ ] Attribute management interface fully functional
- [ ] Attribute creation and editing with all data types supported
- [ ] Options management for select/multi-select types
- [ ] Attribute preview and validation testing working
- [ ] Search and filtering of attributes working properly  
- [ ] All files under 150 lines with proper imports 