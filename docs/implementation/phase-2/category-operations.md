# Category Operations Implementation

## Core Category Management Functions

### 1. Category Types Definition
- [ ] Create: `src/types/categories.ts` (under 150 lines)

```typescript
// src/types/categories.ts
import { Database } from './supabase';

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  parent?: Category;
}

export interface CategoryWithAttributes extends Category {
  attributes: {
    id: string;
    name: string;
    display_label: string;
    data_type: string;
    is_required: boolean;
    display_order: number;
    validation_rules: any;
    options?: any;
  }[];
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  level: number;
  path: string;
  hasChildren: boolean;
  children?: CategoryTreeNode[];
}

export type CategoryCreationRequest = {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  metadata?: Record<string, any>;
};

export type CategoryUpdateRequest = Partial<CategoryCreationRequest> & {
  id: string;
};
```

### 2. Category Operations
- [ ] Create: `src/common/operations/categoryOperations.ts` (under 150 lines)

```typescript
// src/common/operations/categoryOperations.ts
import { supabase } from '@/common/supabase';
import type {
  Category,
  CategoryWithChildren,
  CategoryWithAttributes,
  CategoryTreeNode,
  CategoryCreationRequest,
  CategoryUpdateRequest
} from '@/types/categories';

export class CategoryOperations {
  
  /**
   * Get all categories with hierarchical structure
   */
  static async getAllCategoriesTree(): Promise<CategoryTreeNode[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

    return this.buildCategoryTree(data);
  }

  /**
   * Get category by ID with attributes
   */
  static async getCategoryWithAttributes(categoryId: string): Promise<CategoryWithAttributes | null> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        category_attributes!inner(
          is_required,
          display_order,
          attribute_definitions(
            id,
            name,
            display_label,
            data_type,
            validation_rules,
            options
          )
        )
      `)
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return {
      ...data,
      attributes: data.category_attributes.map(ca => ({
        id: ca.attribute_definitions.id,
        name: ca.attribute_definitions.name,
        display_label: ca.attribute_definitions.display_label,
        data_type: ca.attribute_definitions.data_type,
        is_required: ca.is_required,
        display_order: ca.display_order,
        validation_rules: ca.attribute_definitions.validation_rules,
        options: ca.attribute_definitions.options
      })).sort((a, b) => a.display_order - b.display_order)
    };
  }

  /**
   * Create new category
   */
  static async createCategory(categoryData: CategoryCreationRequest): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        parent_id: categoryData.parent_id,
        icon: categoryData.icon,
        color: categoryData.color,
        sort_order: categoryData.sort_order || 0,
        metadata: categoryData.metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);

    return data;
  }

  /**
   * Update existing category
   */
  static async updateCategory(updateData: CategoryUpdateRequest): Promise<Category> {
    const { id, ...updates } = updateData;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);

    return data;
  }

  /**
   * Delete category (soft delete - mark as inactive)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    // Check if category has children
    const { data: children } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)
      .eq('is_active', true);

    if (children && children.length > 0) {
      throw new Error('Cannot delete category with child categories');
    }

    // Check if category has items
    const { data: items } = await supabase
      .from('items')
      .select('id')
      .eq('category_id', categoryId);

    if (items && items.length > 0) {
      throw new Error('Cannot delete category with associated items');
    }

    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId);

    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }

  /**
   * Get category hierarchy path
   */
  static async getCategoryPath(categoryId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_category_path', { category_uuid: categoryId });

    if (error) throw new Error(`Failed to get category path: ${error.message}`);

    return data || '';
  }

  /**
   * Build hierarchical tree structure from flat category list
   */
  private static buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // Create category nodes
    categories.forEach(category => {
      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
        level: 0,
        path: category.name,
        hasChildren: false,
        children: []
      };
      categoryMap.set(category.id, node);
    });

    // Build hierarchy
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children!.push(node);
          parent.hasChildren = true;
          node.level = parent.level + 1;
          node.path = `${parent.path} > ${node.name}`;
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort children by sort_order and name
    const sortCategories = (cats: CategoryTreeNode[]) => {
      cats.sort((a, b) => a.name.localeCompare(b.name));
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };

    sortCategories(rootCategories);
    return rootCategories;
  }

  /**
   * Get categories for dropdown/select options
   */
  static async getCategoriesForSelect(): Promise<Array<{id: string, name: string, path: string}>> {
    const tree = await this.getAllCategoriesTree();
    const options: Array<{id: string, name: string, path: string}> = [];

    const flatten = (nodes: CategoryTreeNode[], prefix = '') => {
      nodes.forEach(node => {
        options.push({
          id: node.id,
          name: node.name,
          path: node.path
        });
        if (node.children && node.children.length > 0) {
          flatten(node.children, prefix + '  ');
        }
      });
    };

    flatten(tree);
    return options;
  }
}
```

### 3. Category Validation
- [ ] Create: `src/common/validators/categoryValidator.ts` (under 150 lines)

```typescript
// src/common/validators/categoryValidator.ts
import { z } from 'zod';

export const categoryCreationSchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-&()]+$/, 'Category name contains invalid characters'),
  
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  parent_id: z.string().uuid('Invalid parent category ID').optional(),
  
  icon: z.string()
    .max(50, 'Icon identifier too long')
    .optional(),
  
  color: z.string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color')
    .optional(),
  
  sort_order: z.number()
    .min(0, 'Sort order must be non-negative')
    .max(9999, 'Sort order too large')
    .optional(),
  
  metadata: z.record(z.any()).optional()
});

export const categoryUpdateSchema = categoryCreationSchema
  .partial()
  .extend({
    id: z.string().uuid('Invalid category ID')
  });

export const categorySlugSchema = z.object({
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
});

// Type inference from schemas
export type CategoryCreationInput = z.infer<typeof categoryCreationSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategorySlugInput = z.infer<typeof categorySlugSchema>;

// Validation helper functions
export class CategoryValidator {
  static validateCategoryCreation(data: unknown): CategoryCreationInput {
    return categoryCreationSchema.parse(data);
  }

  static validateCategoryUpdate(data: unknown): CategoryUpdateInput {
    return categoryUpdateSchema.parse(data);
  }

  static validateSlug(data: unknown): CategorySlugInput {
    return categorySlugSchema.parse(data);
  }

  /**
   * Check if slug is available
   */
  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const { supabase } = await import('@/common/supabase');
    
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return !data || data.length === 0;
  }

  /**
   * Generate unique slug from name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate category hierarchy (prevent circular references)
   */
  static async validateHierarchy(categoryId: string, parentId: string): Promise<boolean> {
    if (categoryId === parentId) {
      return false; // Self-reference
    }

    const { supabase } = await import('@/common/supabase');
    
    // Check if proposed parent is actually a descendant
    const { data } = await supabase
      .from('categories')
      .select('id, parent_id')
      .eq('is_active', true);

    if (!data) return true;

    const buildAncestors = (id: string, visited = new Set<string>()): string[] => {
      if (visited.has(id)) return []; // Circular reference detected
      visited.add(id);

      const category = data.find(c => c.id === id);
      if (!category || !category.parent_id) return [];

      return [category.parent_id, ...buildAncestors(category.parent_id, visited)];
    };

    const ancestors = buildAncestors(parentId);
    return !ancestors.includes(categoryId);
  }
}
```

### 4. Category Hooks
- [ ] Create: `src/common/hooks/useCategories.ts` (under 150 lines)

```typescript
// src/common/hooks/useCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { CategoryOperations } from '@/common/operations/categoryOperations';
import type { 
  Category, 
  CategoryTreeNode, 
  CategoryWithAttributes,
  CategoryCreationRequest,
  CategoryUpdateRequest 
} from '@/types/categories';

interface UseCategoriesReturn {
  categories: CategoryTreeNode[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCategory: (data: CategoryCreationRequest) => Promise<Category>;
  updateCategory: (data: CategoryUpdateRequest) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryOperations.getAllCategoriesTree();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (data: CategoryCreationRequest): Promise<Category> => {
    try {
      const newCategory = await CategoryOperations.createCategory(data);
      await fetchCategories(); // Refresh list
      return newCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
      throw new Error(message);
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (data: CategoryUpdateRequest): Promise<Category> => {
    try {
      const updatedCategory = await CategoryOperations.updateCategory(data);
      await fetchCategories(); // Refresh list
      return updatedCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      throw new Error(message);
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      await CategoryOperations.deleteCategory(id);
      await fetchCategories(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      throw new Error(message);
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

interface UseCategoryReturn {
  category: CategoryWithAttributes | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategory(categoryId: string | null): UseCategoryReturn {
  const [category, setCategory] = useState<CategoryWithAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!categoryId) {
      setCategory(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await CategoryOperations.getCategoryWithAttributes(categoryId);
      setCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
}
```

### 5. Category Formatters
- [ ] Create: `src/common/formatters/categoryFormatter.ts` (under 150 lines)

```typescript
// src/common/formatters/categoryFormatter.ts
import type { Category, CategoryTreeNode } from '@/types/categories';

export class CategoryFormatter {
  /**
   * Get category display name with hierarchy
   */
  static getDisplayName(category: CategoryTreeNode, showPath = false): string {
    if (showPath && category.level > 0) {
      return category.path;
    }
    return category.name;
  }

  /**
   * Get category icon with fallback
   */
  static getIcon(category: Category): string {
    return category.icon || 'folder';
  }

  /**
   * Get category color with fallback
   */
  static getColor(category: Category): string {
    return category.color || '#6b7280';
  }

  /**
   * Format category for breadcrumb display
   */
  static formatBreadcrumb(path: string): Array<{name: string}> {
    return path.split(' > ').map(name => ({ name: name.trim() }));
  }

  /**
   * Get category depth indicator
   */
  static getDepthIndicator(level: number): string {
    return '  '.repeat(level) + (level > 0 ? '└ ' : '');
  }

  /**
   * Generate category badge classes
   */
  static getBadgeClasses(category: Category): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    if (category.color) {
      // Use category-specific color
      return `${baseClasses} text-white`;
    }
    
    // Default styling
    return `${baseClasses} bg-gray-100 text-gray-800`;
  }

  /**
   * Format category stats
   */
  static formatStats(itemCount: number): string {
    if (itemCount === 0) return 'No items';
    if (itemCount === 1) return '1 item';
    return `${itemCount.toLocaleString()} items`;
  }

  /**
   * Sort categories by name
   */
  static sortByName(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sort categories by sort order, then name
   */
  static sortBySortOrder(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Filter active categories
   */
  static filterActive(categories: Category[]): Category[] {
    return categories.filter(cat => cat.is_active);
  }

  /**
   * Find category by slug
   */
  static findBySlug(categories: Category[], slug: string): Category | undefined {
    return categories.find(cat => cat.slug === slug);
  }

  /**
   * Get all descendant category IDs
   */
  static getDescendantIds(categories: Category[], parentId: string): string[] {
    const descendants: string[] = [];
    const children = categories.filter(cat => cat.parent_id === parentId);
    
    for (const child of children) {
      descendants.push(child.id);
      descendants.push(...this.getDescendantIds(categories, child.id));
    }
    
    return descendants;
  }
}
```

## Integration Tasks

### 6. Update Existing Components
- [ ] Modify existing tool components to use category system
- [ ] Update tool creation forms to use category selection
- [ ] Add category-based filtering to tool lists

### 7. Testing Tasks
- [ ] Test category creation and validation
- [ ] Test hierarchical category structure
- [ ] Test category deletion with dependency checks
- [ ] Verify slug uniqueness validation
- [ ] Test category tree building performance

## Success Criteria
- [ ] All category operations work correctly
- [ ] Hierarchical category structure functional
- [ ] Category validation prevents invalid data
- [ ] Category hooks provide reactive data
- [ ] Performance remains optimal with large category trees
- [ ] All files under 150 lines with proper imports 