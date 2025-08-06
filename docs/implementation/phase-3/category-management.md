# Category Management Interface

## Admin Category CRUD Interfaces

### 1. Category Management Page
- [ ] Create: `src/app/admin/categories/page.tsx` (under 150 lines)

```tsx
// src/app/admin/categories/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Heading } from '@/primitives/heading';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { CategoryTreeView } from './components/CategoryTreeView';
import { CategoryFormModal } from './components/CategoryFormModal';
import { CategoryAttributeModal } from './components/CategoryAttributeModal';
import { useCategories } from '@/common/hooks/useCategories';
import type { Category } from '@/types/categories';

export default function AdminCategoriesPage() {
  const { categories, loading, error, refetch } = useCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingAttributes, setManagingAttributes] = useState<Category | null>(null);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const handleManageAttributes = (category: Category) => {
    setManagingAttributes(category);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    refetch();
  };

  const handleAttributeModalClose = () => {
    setManagingAttributes(null);
    refetch();
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
            <p className="text-red-800">Error loading categories: {error}</p>
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
          <Heading level={1}>Category Management</Heading>
          <Button onClick={handleCreateCategory}>
            Create Category
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <CategoryTreeView
            categories={categories}
            onEdit={handleEditCategory}
            onManageAttributes={handleManageAttributes}
            onRefresh={refetch}
          />
        </div>

        {showCreateModal && (
          <CategoryFormModal
            category={editingCategory}
            onClose={handleModalClose}
            onSuccess={handleModalClose}
          />
        )}

        {managingAttributes && (
          <CategoryAttributeModal
            category={managingAttributes}
            onClose={handleAttributeModalClose}
            onSuccess={handleAttributeModalClose}
          />
        )}
      </div>
    </AdminProtection>
  );
}
```

### 2. Category Tree View Component
- [ ] Create: `src/app/admin/categories/components/CategoryTreeView.tsx` (under 150 lines)

```tsx
// src/app/admin/categories/components/CategoryTreeView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { ChevronRightIcon, ChevronDownIcon, PencilIcon, CogIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CategoryFormatter } from '@/common/formatters/categoryFormatter';
import { CategoryOperations } from '@/common/operations/categoryOperations';
import type { CategoryTreeNode } from '@/types/categories';

interface Props {
  categories: CategoryTreeNode[];
  onEdit: (category: any) => void;
  onManageAttributes: (category: any) => void;
  onRefresh: () => void;
}

export function CategoryTreeView({ categories, onEdit, onManageAttributes, onRefresh }: Props) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDelete = async (category: CategoryTreeNode) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(category.id);
    try {
      await CategoryOperations.deleteCategory(category.id);
      onRefresh();
    } catch (error) {
      alert(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const renderCategoryNode = (node: CategoryTreeNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(node.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6"></div>
            )}

            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: node.color || '#6b7280' }}
            ></div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{node.name}</span>
                <Badge variant="secondary">{node.slug}</Badge>
              </div>
              {node.level > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  {CategoryFormatter.getDepthIndicator(node.level)}{node.path}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(node)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageAttributes(node)}
            >
              <CogIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(node)}
              disabled={deletingId === node.id}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deletingId === node.id ? (
                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 border-l border-gray-200">
            {node.children!.map(child => renderCategoryNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="mb-4">
          <CogIcon className="h-12 w-12 mx-auto text-gray-300" />
        </div>
        <p>No categories found. Create your first category to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {categories.map(category => renderCategoryNode(category))}
    </div>
  );
}
```

### 3. Category Form Modal
- [ ] Create: `src/app/admin/categories/components/CategoryFormModal.tsx` (under 150 lines)

```tsx
// src/app/admin/categories/components/CategoryFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/primitives/dialog';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Select } from '@/primitives/select';
import { CategoryValidator, categoryCreationSchema } from '@/common/validators/categoryValidator';
import { CategoryOperations } from '@/common/operations/categoryOperations';
import { useCategories } from '@/common/hooks/useCategories';
import type { Category, CategoryCreationRequest } from '@/types/categories';
import type { z } from 'zod';

interface Props {
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = z.infer<typeof categoryCreationSchema>;

const PRESET_COLORS = [
  '#f59e0b', '#10b981', '#22c55e', '#3b82f6', 
  '#8b5cf6', '#ef4444', '#6b7280', '#06b6d4'
];

const PRESET_ICONS = [
  'folder', 'tool', 'zap', 'leaf', 'car', 'ruler', 
  'shield', 'screw', 'spray-bottle', 'wrench'
];

export function CategoryFormModal({ category, onClose, onSuccess }: Props) {
  const { categories } = useCategories();
  const [submitting, setSubmitting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(categoryCreationSchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      parent_id: category?.parent_id || undefined,
      icon: category?.icon || 'folder',
      color: category?.color || '#6b7280',
      sort_order: category?.sort_order || 0
    }
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && watchedName) {
      const generatedSlug = CategoryValidator.generateSlug(watchedName);
      setValue('slug', generatedSlug);
    }
  }, [watchedName, setValue, category]);

  // Check slug availability
  useEffect(() => {
    if (watchedSlug && watchedSlug.length > 1) {
      const checkSlug = async () => {
        const available = await CategoryValidator.isSlugAvailable(
          watchedSlug, 
          category?.id
        );
        setSlugAvailable(available);
      };
      checkSlug();
    }
  }, [watchedSlug, category?.id]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (category) {
        await CategoryOperations.updateCategory({ id: category.id, ...data });
      } else {
        await CategoryOperations.createCategory(data);
      }
      onSuccess();
    } catch (error) {
      alert(`Failed to ${category ? 'update' : 'create'} category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories
    .filter(cat => !category || cat.id !== category.id) // Don't allow self-parent
    .map(cat => ({
      value: cat.id,
      label: cat.path
    }));

  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">
          {category ? 'Edit Category' : 'Create Category'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                {...register('name')}
                placeholder="Category name"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <Input
                {...register('slug')}
                placeholder="category-slug"
                error={errors.slug?.message}
              />
              {slugAvailable === false && (
                <p className="text-sm text-red-600 mt-1">Slug is already taken</p>
              )}
              {slugAvailable === true && (
                <p className="text-sm text-green-600 mt-1">Slug is available</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              {...register('description')}
              placeholder="Category description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parent Category</label>
              <Select {...register('parent_id')}>
                <option value="">None (Root Category)</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort Order</label>
              <Input
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <Select {...register('icon')}>
                {PRESET_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex space-x-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Input
                {...register('color')}
                placeholder="#6b7280"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || slugAvailable === false}
            >
              {submitting ? 'Saving...' : (category ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
```

### 4. Category Attribute Management Modal
- [ ] Create: `src/app/admin/categories/components/CategoryAttributeModal.tsx` (under 150 lines)

```tsx
// src/app/admin/categories/components/CategoryAttributeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/primitives/dialog';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Switch } from '@/primitives/switch';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAttributes } from '@/common/hooks/useAttributes';
import { CategoryOperations } from '@/common/operations/categoryOperations';
import { createClient } from '@/common/supabase/client';
import type { Category } from '@/types/categories';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface Props {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryAttribute {
  attribute_definition_id: string;
  is_required: boolean;
  display_order: number;
  attribute: AttributeDefinitionWithOptions;
}

export function CategoryAttributeModal({ category, onClose, onSuccess }: Props) {
  const { attributes: allAttributes } = useAttributes();
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<AttributeDefinitionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategoryAttributes = async () => {
      try {
        const categoryWithAttrs = await CategoryOperations.getCategoryWithAttributes(category.id);
        if (categoryWithAttrs) {
          setCategoryAttributes(
            categoryWithAttrs.attributes.map(attr => ({
              attribute_definition_id: attr.id,
              is_required: attr.is_required,
              display_order: attr.display_order,
              attribute: attr as AttributeDefinitionWithOptions
            }))
          );
        }

        // Set available attributes (not already assigned)
        const assignedIds = new Set(categoryAttributes.map(ca => ca.attribute_definition_id));
        setAvailableAttributes(allAttributes.filter(attr => !assignedIds.has(attr.id)));
      } catch (error) {
        console.error('Failed to load category attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryAttributes();
  }, [category.id, allAttributes]);

  const handleAddAttribute = async (attributeId: string) => {
    try {
      const { error } = await supabase
        .from('category_attributes')
        .insert({
          category_id: category.id,
          attribute_definition_id: attributeId,
          is_required: false,
          display_order: categoryAttributes.length
        });

      if (error) throw error;

      const attribute = allAttributes.find(attr => attr.id === attributeId);
      if (attribute) {
        setCategoryAttributes(prev => [...prev, {
          attribute_definition_id: attributeId,
          is_required: false,
          display_order: prev.length,
          attribute
        }]);

        setAvailableAttributes(prev => prev.filter(attr => attr.id !== attributeId));
      }
    } catch (error) {
      alert(`Failed to add attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRemoveAttribute = async (attributeId: string) => {
    try {
      const { error } = await supabase
        .from('category_attributes')
        .delete()
        .eq('category_id', category.id)
        .eq('attribute_definition_id', attributeId);

      if (error) throw error;

      const removedAttribute = categoryAttributes.find(ca => ca.attribute_definition_id === attributeId);
      
      setCategoryAttributes(prev => prev.filter(ca => ca.attribute_definition_id !== attributeId));
      
      if (removedAttribute) {
        setAvailableAttributes(prev => [...prev, removedAttribute.attribute]);
      }
    } catch (error) {
      alert(`Failed to remove attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleRequired = async (attributeId: string, required: boolean) => {
    try {
      const { error } = await supabase
        .from('category_attributes')
        .update({ is_required: required })
        .eq('category_id', category.id)
        .eq('attribute_definition_id', attributeId);

      if (error) throw error;

      setCategoryAttributes(prev =>
        prev.map(ca =>
          ca.attribute_definition_id === attributeId
            ? { ...ca, is_required: required }
            : ca
        )
      );
    } catch (error) {
      alert(`Failed to update attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setSaving(false);
      onSuccess();
    }, 500);
  };

  if (loading) {
    return (
      <Dialog open onClose={onClose} size="xl">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">
          Manage Attributes for "{category.name}"
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Assigned Attributes */}
          <div>
            <h3 className="font-medium mb-4">Assigned Attributes</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categoryAttributes.length === 0 ? (
                <p className="text-gray-500 text-sm">No attributes assigned</p>
              ) : (
                categoryAttributes.map(catAttr => (
                  <div
                    key={catAttr.attribute_definition_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{catAttr.attribute.display_label}</span>
                        <Badge variant="outline">{catAttr.attribute.data_type}</Badge>
                        {catAttr.is_required && <Badge variant="destructive">Required</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">{catAttr.attribute.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={catAttr.is_required}
                        onChange={(checked) => handleToggleRequired(catAttr.attribute_definition_id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAttribute(catAttr.attribute_definition_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Attributes */}
          <div>
            <h3 className="font-medium mb-4">Available Attributes</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableAttributes.length === 0 ? (
                <p className="text-gray-500 text-sm">No more attributes available</p>
              ) : (
                availableAttributes.map(attr => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{attr.display_label}</span>
                        <Badge variant="outline">{attr.data_type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{attr.description}</p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddAttribute(attr.id)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
```

## Success Criteria
- [ ] Category management interface fully functional
- [ ] Hierarchical category tree with expand/collapse
- [ ] Category creation and editing working
- [ ] Category-attribute association management working
- [ ] Bulk operations available for categories
- [ ] All files under 150 lines with proper imports 