# Category-Driven Item Forms

## Enhanced Item Creation/Editing Forms

### 1. Enhanced Add Tool Form
- [ ] Update: `src/app/tools/add/components/AddToolForm.tsx` (under 150 lines)

```tsx
// src/app/tools/add/components/AddToolForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/primitives/button';
import { Heading } from '@/primitives/heading';
import { Select } from '@/primitives/select';
import { DynamicFormBuilder } from '@/common/forms/DynamicFormBuilder';
import { FormStateManager, FormUtils } from '@/common/forms/FormStateManager';
import { CategorySelector } from './CategorySelector';
import { BasicItemFields } from './BasicItemFields';
import { ItemOperations } from '@/common/operations/itemOperations';
import { useCategories } from '@/common/hooks/useCategories';
import { useRouter } from 'next/navigation';
import type { ItemCreationRequest } from '@/types/item';

export function AddToolForm() {
  const router = useRouter();
  const { categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [basicFormData, setBasicFormData] = useState<Partial<ItemCreationRequest>>({});
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'category' | 'basic' | 'attributes'>('category');

  const formKey = FormUtils.generateFormKey('add-item');
  const { setAutoSaveData, getAutoSaveData, clearAutoSaveData } = FormStateManager();

  // Load auto-saved data on mount
  useEffect(() => {
    const savedData = getAutoSaveData(formKey);
    if (savedData) {
      setSelectedCategoryId(savedData.externalCategoryId || null);
      setBasicFormData(savedData.basicData || {});
      setDynamicFormData(savedData.dynamicData || {});
      if (savedData.externalCategoryId) {
        setCurrentStep('attributes');
      }
    }
  }, [formKey, getAutoSaveData]);

  // Auto-save form data
  const autoSave = FormUtils.debounce(() => {
    setAutoSaveData(formKey, {
      externalCategoryId: selectedCategoryId,
      basicData: basicFormData,
      dynamicData: dynamicFormData
    });
  }, 1000);

  useEffect(() => {
    if (selectedCategoryId || Object.keys(basicFormData).length > 0 || Object.keys(dynamicFormData).length > 0) {
      autoSave();
    }
  }, [selectedCategoryId, basicFormData, dynamicFormData, autoSave]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setDynamicFormData({}); // Reset dynamic data when category changes
    setCurrentStep('basic');
  };

  const handleBasicFormChange = (data: Partial<ItemCreationRequest>, valid: boolean) => {
    setBasicFormData(data);
    if (valid && data.name && data.description) {
      setCurrentStep('attributes');
    }
  };

  const handleDynamicFormChange = (data: Record<string, any>, valid: boolean) => {
    setDynamicFormData(data);
    setIsFormValid(valid && !!basicFormData.name && !!basicFormData.description);
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId || !basicFormData.name || !basicFormData.description) {
      return;
    }

    setSubmitting(true);
    try {
      const itemData: ItemCreationRequest = {
        ...basicFormData,
        external_category_id: selectedCategoryId,
        attributes: dynamicFormData,
        is_public: basicFormData.is_public ?? true,
        is_available: basicFormData.is_available ?? true,
        is_shareable: basicFormData.is_shareable ?? true
      } as ItemCreationRequest;

      const newItem = await ItemOperations.createItem(itemData);
      
      // Clear auto-saved data
      clearAutoSaveData(formKey);
      
      // Redirect to the new item
      router.push(`/tools/${newItem.id}`);
    } catch (error) {
      alert(`Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'category':
        return 'Choose Category';
      case 'basic':
        return 'Basic Information';
      case 'attributes':
        return 'Category Details';
      default:
        return 'Create Item';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'category':
        return !!selectedCategoryId;
      case 'basic':
        return !!basicFormData.name && !!basicFormData.description;
      case 'attributes':
        return isFormValid;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>Add New Item</Heading>
        <p className="text-gray-600 mt-2">
          {getStepTitle()} - {currentStep === 'category' ? 'Select the category that best describes your item' :
           currentStep === 'basic' ? 'Provide basic information about your item' :
           'Fill in category-specific details'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['category', 'basic', 'attributes'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : index < ['category', 'basic', 'attributes'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step === 'category' ? 'Category' : step === 'basic' ? 'Basic Info' : 'Details'}
              </span>
              {index < 2 && (
                <div className={`w-16 h-1 mx-4 ${
                  index < ['category', 'basic', 'attributes'].indexOf(currentStep)
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Step 1: Category Selection */}
        {currentStep === 'category' && (
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
          />
        )}

        {/* Step 2: Basic Information */}
        {currentStep === 'basic' && (
          <BasicItemFields
            initialValues={basicFormData}
            onFormChange={handleBasicFormChange}
            onNext={() => setCurrentStep('attributes')}
          />
        )}

        {/* Step 3: Category-Specific Attributes */}
        {currentStep === 'attributes' && selectedCategoryId && (
          <DynamicFormBuilder
            externalCategoryId={selectedCategoryId}
            initialValues={dynamicFormData}
            onFormChange={handleDynamicFormChange}
            onSubmit={async () => await handleSubmit()}
          >
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('basic')}
              >
                Back to Basic Info
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    clearAutoSaveData(formKey);
                    router.push('/tools');
                  }}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={!canProceed() || submitting}
                >
                  {submitting ? 'Creating...' : 'Create Item'}
                </Button>
              </div>
            </div>
          </DynamicFormBuilder>
        )}

        {/* Navigation for Category and Basic steps */}
        {(currentStep === 'category' || currentStep === 'basic') && (
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep === 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('category')}
                >
                  Back to Category
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearAutoSaveData(formKey);
                  router.push('/tools');
                }}
              >
                Cancel
              </Button>
              
              {currentStep === 'category' && (
                <Button
                  onClick={() => selectedCategoryId && setCurrentStep('basic')}
                  disabled={!selectedCategoryId}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Category Selector Component
- [ ] Create: `src/app/tools/add/components/CategorySelector.tsx` (under 150 lines)

```tsx
// src/app/tools/add/components/CategorySelector.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/primitives/input';
import { Badge } from '@/primitives/badge';
import { MagnifyingGlassIcon, FolderIcon } from '@heroicons/react/24/outline';
import { CategoryFormatter } from '@/common/formatters/categoryFormatter';
import type { ExternalCategory } from '@/types/categories';

interface Props {
  categories: ExternalCategory[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number) => void;
}

export function CategorySelector({ categories, selectedCategoryId, onCategorySelect }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filterCategories = (categories: ExternalCategory[]): ExternalCategory[] => {
    if (!searchTerm) return categories;

    return categories.filter(category => {
      const matchesSearch = category.category_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.category_path.toLowerCase().includes(searchTerm.toLowerCase());
      
      const childMatches = category.children ? filterCategories(category.children).length > 0 : false;
      
      return matchesSearch || childMatches;
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children) : undefined
    }));
  };

  const renderCategory = (category: ExternalCategory, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.external_id);
    const isSelected = selectedCategoryId === category.external_id;

          return (
        <div key={category.external_id}>
        <div
          className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-50 border-2 border-blue-200'
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
          }`}
          style={{ marginLeft: depth * 20 }}
          onClick={() => onCategorySelect(category.external_id)}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(category.external_id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color || '#6b7280' }}
              />

              <FolderIcon className="h-5 w-5 text-gray-400" />

              <div>
                <h3 className="font-medium text-gray-900">{category.category_path.split(' > ').pop()}</h3>
                <p className="text-sm text-gray-600 mt-1">{category.category_path}</p>
              </div>
            </div>

            {depth > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                ID: {category.external_id}
              </div>
            )}
          </div>

          {isSelected && (
            <div className="ml-4">
              <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categories);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No categories available. Please contact an administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Select Item Category</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose the category that best describes your item. This will determine what additional information you'll need to provide.
        </p>

        <div className="relative mb-6">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No categories match your search.</p>
          </div>
        ) : (
          filteredCategories.map(category => renderCategory(category))
        )}
      </div>

      {selectedCategoryId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              Category selected: {categories.find(c => c.external_id === selectedCategoryId)?.category_path.split(' > ').pop()}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            You can proceed to the next step to provide basic information about your item.
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3. Basic Item Fields Component
- [ ] Create: `src/app/tools/add/components/BasicItemFields.tsx` (under 150 lines)

```tsx
// src/app/tools/add/components/BasicItemFields.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Select } from '@/primitives/select';
import { Switch } from '@/primitives/switch';
import { ImageUploader } from './ImageUploader';
import type { ItemCreationRequest } from '@/types/item';

const basicFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be under 1000 characters'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  location: z.string().max(100, 'Location must be under 100 characters').optional(),
  tags: z.string().optional(),
  images: z.array(z.string()).optional(),
  is_public: z.boolean(),
  is_available: z.boolean(),
  is_shareable: z.boolean()
});

type BasicFormData = z.infer<typeof basicFormSchema>;

interface Props {
  initialValues: Partial<ItemCreationRequest>;
  onFormChange: (data: Partial<ItemCreationRequest>, valid: boolean) => void;
  onNext: () => void;
}

export function BasicItemFields({ initialValues, onFormChange, onNext }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      name: initialValues.name || '',
      description: initialValues.description || '',
      condition: initialValues.condition || 'good',
      location: initialValues.location || '',
      tags: initialValues.tags?.join(', ') || '',
      images: initialValues.images || [],
      is_public: initialValues.is_public ?? true,
      is_available: initialValues.is_available ?? true,
      is_shareable: initialValues.is_shareable ?? true
    },
    mode: 'onChange'
  });

  const formData = watch();

  // Notify parent of form changes
  useEffect(() => {
    const processedData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    onFormChange(processedData, isValid);
  }, [formData, isValid, onFormChange]);

  const handleImagesChange = (images: string[]) => {
    setValue('images', images);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h2>
        <p className="text-sm text-gray-600 mb-6">
          Provide the essential details about your item that help others understand what it is.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <Input
            {...register('name')}
            placeholder="Enter a clear, descriptive name"
            error={errors.name?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            Be specific and descriptive (e.g., "DeWalt 20V Max Cordless Drill" vs "Drill")
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <Textarea
            {...register('description')}
            rows={4}
            placeholder="Describe the item in detail, including its features, condition, and any relevant information"
            error={errors.description?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            Include details about size, brand, model, features, and current condition
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition *
          </label>
          <Select {...register('condition')} error={errors.condition?.message}>
            <option value="excellent">Excellent - Like new, minimal wear</option>
            <option value="good">Good - Some wear, fully functional</option>
            <option value="fair">Fair - Noticeable wear, may need minor repairs</option>
            <option value="poor">Poor - Significant wear, needs repairs</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Input
            {...register('location')}
            placeholder="Where the item is located"
            error={errors.location?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            General area, neighborhood, or building (optional)
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <Input
            {...register('tags')}
            placeholder="power tools, woodworking, DIY, home improvement"
            error={errors.tags?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            Comma-separated tags to help others find your item
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <ImageUploader
            images={formData.images || []}
            onImagesChange={handleImagesChange}
            maxImages={5}
          />
          <p className="mt-1 text-xs text-gray-500">
            Add up to 5 images showing the item from different angles
          </p>
        </div>
      </div>

      {/* Visibility and Sharing Settings */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sharing Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Make item public</span>
              <p className="text-xs text-gray-500">Allow others to discover and view this item</p>
            </div>
            <Switch
              checked={formData.is_public}
              onChange={(checked) => setValue('is_public', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Currently available</span>
              <p className="text-xs text-gray-500">Item is available for borrowing/sharing</p>
            </div>
            <Switch
              checked={formData.is_available}
              onChange={(checked) => setValue('is_available', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Allow sharing</span>
              <p className="text-xs text-gray-500">Allow others to request to borrow this item</p>
            </div>
            <Switch
              checked={formData.is_shareable}
              onChange={(checked) => setValue('is_shareable', checked)}
            />
          </div>
        </div>
      </div>

      {isValid && formData.name && formData.description && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">
              Basic information complete
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            You can now proceed to provide category-specific details.
          </p>
        </div>
      )}
    </div>
  );
}
```

## Success Criteria
- [ ] Category selection drives form field display
- [ ] Multi-step form flow with progress indication
- [ ] Auto-save functionality preserves user progress
- [ ] Form validation works across all steps
- [ ] Seamless integration with dynamic form engine
- [ ] All files under 150 lines with proper imports 