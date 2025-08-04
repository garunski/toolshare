# Item Enhancement Implementation

## Enhanced Item Management with Dynamic Properties

### 1. Item Types Enhancement
- [ ] Update: `src/types/tool.ts` → `src/types/item.ts` (under 150 lines)

```typescript
// src/types/item.ts
import { Database } from './supabase';
import type { Category } from './categories';
import type { AttributeDefinitionWithOptions } from './attributes';

export type Item = Database['public']['Tables']['items']['Row'];
export type ItemInsert = Database['public']['Tables']['items']['Insert'];
export type ItemUpdate = Database['public']['Tables']['items']['Update'];

export interface ItemWithCategory extends Item {
  category: Category;
}

export interface ItemWithDetails extends Item {
  category: Category;
  owner: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ItemWithAttributes extends ItemWithDetails {
  categoryAttributes: AttributeDefinitionWithOptions[];
  parsedAttributes: Record<string, any>;
}

export interface ItemCreationRequest {
  name: string;
  description?: string;
  external_category_id: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  attributes: Record<string, any>;
  images?: string[];
  location?: string;
  is_available?: boolean;
  is_shareable?: boolean;
  is_public?: boolean;
  tags?: string[];
}

export interface ItemUpdateRequest extends Partial<ItemCreationRequest> {
  id: string;
}

export interface ItemSearchFilters {
  external_category_id?: number;
  condition?: string[];
  location?: string;
  is_available?: boolean;
  price_min?: number;
  price_max?: number;
  attributes?: Record<string, any>;
  tags?: string[];
  search_text?: string;
}

export interface ItemSearchResult extends ItemWithDetails {
  relevance_score?: number;
  distance?: number;
}
```

### 2. Enhanced Item Operations
- [ ] Update: `src/common/operations/toolCRUD.ts` → `src/common/operations/itemOperations.ts` (under 150 lines)

```typescript
// src/common/operations/itemOperations.ts
import { supabase } from '@/common/supabase';
import { CategoryOperations } from './categoryOperations';
import { AttributeOperations } from './attributeOperations';
import type {
  Item,
  ItemWithCategory,
  ItemWithDetails,
  ItemWithAttributes,
  ItemCreationRequest,
  ItemUpdateRequest,
  ItemSearchFilters,
  ItemSearchResult
} from '@/types/item';

export class ItemOperations {
  
  /**
   * Get item by ID with full details
   */
  static async getItemById(itemId: string): Promise<ItemWithAttributes | null> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        owner:profiles(id, full_name, avatar_url)
      `)
      .eq('id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch item: ${error.message}`);
    }

    // Get category attributes
    const categoryAttributes = await CategoryOperations.getCategoryWithAttributes(data.category_id);
    
    return {
      ...data,
      categoryAttributes: categoryAttributes?.attributes || [],
      parsedAttributes: data.attributes || {}
    };
  }

  /**
   * Create new item with dynamic attributes
   */
  static async createItem(itemData: ItemCreationRequest): Promise<Item> {
    // Validate attributes against category requirements
    const isValid = await supabase
      .rpc('validate_item_attributes', {
        category_uuid: itemData.category_id,
        item_attributes: itemData.attributes
      });

    if (!isValid.data) {
      throw new Error('Item attributes do not meet category requirements');
    }

    const { data, error } = await supabase
      .from('items')
      .insert({
        owner_id: (await supabase.auth.getUser()).data.user?.id,
        name: itemData.name,
        description: itemData.description,
        category_id: itemData.category_id,
        condition: itemData.condition,
        attributes: itemData.attributes,
        images: itemData.images || [],
        location: itemData.location,
        is_available: itemData.is_available !== false,
        is_shareable: itemData.is_shareable !== false,
        is_public: itemData.is_public !== false,
        tags: itemData.tags || []
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create item: ${error.message}`);

    return data;
  }

  /**
   * Update existing item
   */
  static async updateItem(updateData: ItemUpdateRequest): Promise<Item> {
    const { id, ...updates } = updateData;

    // If attributes or category changed, validate
    if (updates.attributes || updates.category_id) {
      const currentItem = await this.getItemById(id);
      if (!currentItem) throw new Error('Item not found');

      const categoryId = updates.category_id || currentItem.category_id;
      const attributes = updates.attributes || currentItem.attributes;

      const isValid = await supabase
        .rpc('validate_item_attributes', {
          category_uuid: categoryId,
          item_attributes: attributes
        });

      if (!isValid.data) {
        throw new Error('Updated attributes do not meet category requirements');
      }
    }

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update item: ${error.message}`);

    return data;
  }

  /**
   * Delete item
   */
  static async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw new Error(`Failed to delete item: ${error.message}`);
  }

  /**
   * Search items with filters
   */
  static async searchItems(
    filters: ItemSearchFilters = {},
    limit = 20,
    offset = 0
  ): Promise<ItemSearchResult[]> {
    let query = supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        owner:profiles(id, full_name, avatar_url)
      `)
      .eq('is_public', true)
      .eq('is_available', filters.is_available !== false);

    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.condition?.length) {
      query = query.in('condition', filters.condition);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.search_text) {
      query = query.textSearch('search_vector', filters.search_text);
    }

    // Apply JSONB attribute filters
    if (filters.attributes) {
      Object.entries(filters.attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.contains('attributes', { [key]: value });
        }
      });
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to search items: ${error.message}`);

    return data;
  }

  /**
   * Get items by owner
   */
  static async getItemsByOwner(ownerId: string): Promise<ItemWithCategory[]> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch owner items: ${error.message}`);

    return data;
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(categoryId: string): Promise<ItemWithDetails[]> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        owner:profiles(id, full_name, avatar_url)
      `)
      .eq('category_id', categoryId)
      .eq('is_public', true)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch category items: ${error.message}`);

    return data;
  }

  /**
   * Update item availability
   */
  static async updateItemAvailability(itemId: string, isAvailable: boolean): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ is_available: isAvailable })
      .eq('id', itemId);

    if (error) throw new Error(`Failed to update item availability: ${error.message}`);
  }

  /**
   * Bulk update items (admin function)
   */
  static async bulkUpdateItems(
    itemIds: string[],
    updates: Partial<ItemUpdateRequest>
  ): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update(updates)
      .in('id', itemIds);

    if (error) throw new Error(`Failed to bulk update items: ${error.message}`);
  }

  /**
   * Get item statistics
   */
  static async getItemStats(): Promise<{
    total: number;
    available: number;
    by_category: Array<{ category_name: string; count: number }>;
    by_condition: Array<{ condition: string; count: number }>;
  }> {
    // Get total counts
    const { data: totalData } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true });

    const { data: availableData } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('is_available', true);

    // Get category breakdown
    const { data: categoryStats } = await supabase
      .from('items')
      .select(`
        category_id,
        category:categories(name)
      `)
      .eq('is_public', true);

    // Get condition breakdown
    const { data: conditionStats } = await supabase
      .from('items')
      .select('condition')
      .eq('is_public', true);

    const categoryGroups = categoryStats?.reduce((acc, item) => {
      const name = item.category?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const conditionGroups = conditionStats?.reduce((acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total: totalData?.length || 0,
      available: availableData?.length || 0,
      by_category: Object.entries(categoryGroups).map(([category_name, count]) => ({
        category_name,
        count
      })),
      by_condition: Object.entries(conditionGroups).map(([condition, count]) => ({
        condition,
        count
      }))
    };
  }
}
```

### 3. Item Validation
- [ ] Create: `src/common/validators/itemValidator.ts` (under 150 lines)

```typescript
// src/common/validators/itemValidator.ts
import { z } from 'zod';

export const itemCreationSchema = z.object({
  name: z.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(200, 'Item name must be less than 200 characters'),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  category_id: z.string().uuid('Invalid category ID'),
  
  condition: z.enum(['excellent', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Condition must be excellent, good, fair, or poor' })
  }),
  
  attributes: z.record(z.any()).default({}),
  
  images: z.array(z.string().url('Invalid image URL')).optional(),
  
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  
  is_available: z.boolean().optional(),
  is_shareable: z.boolean().optional(),
  is_public: z.boolean().optional(),
  
  tags: z.array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(50, 'Tag must be less than 50 characters')
  ).max(10, 'Maximum 10 tags allowed').optional()
});

export const itemUpdateSchema = itemCreationSchema
  .partial()
  .extend({
    id: z.string().uuid('Invalid item ID')
  });

export const itemSearchSchema = z.object({
  category_id: z.string().uuid().optional(),
  condition: z.array(z.enum(['excellent', 'good', 'fair', 'poor'])).optional(),
  location: z.string().max(200).optional(),
  is_available: z.boolean().optional(),
  attributes: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  search_text: z.string().max(200).optional()
});

// Type inference
export type ItemCreationInput = z.infer<typeof itemCreationSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type ItemSearchInput = z.infer<typeof itemSearchSchema>;

// Validation helper functions
export class ItemValidator {
  static validateItemCreation(data: unknown): ItemCreationInput {
    return itemCreationSchema.parse(data);
  }

  static validateItemUpdate(data: unknown): ItemUpdateInput {
    return itemUpdateSchema.parse(data);
  }

  static validateItemSearch(data: unknown): ItemSearchInput {
    return itemSearchSchema.parse(data);
  }

  /**
   * Validate item attributes against category requirements
   */
  static async validateItemAttributes(
    categoryId: string,
    attributes: Record<string, any>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const { CategoryOperations } = await import('@/common/operations/categoryOperations');
    const { AttributeOperations } = await import('@/common/operations/attributeOperations');

    const category = await CategoryOperations.getCategoryWithAttributes(categoryId);
    if (!category) {
      return { isValid: false, errors: ['Invalid category'] };
    }

    const errors: string[] = [];

    for (const attr of category.attributes) {
      const value = attributes[attr.name];
      
      // Check if required attribute is missing
      if (attr.is_required && (value === undefined || value === null || value === '')) {
        errors.push(`${attr.display_label} is required`);
        continue;
      }

      // Skip validation if empty and not required
      if (!value) continue;

      // Validate attribute value
      const validationResult = AttributeOperations.validateAttributeValue(value, {
        ...attr,
        parsedOptions: attr.options || [],
        parsedValidationRules: attr.validation_rules || {}
      });

      if (!validationResult.isValid && validationResult.error) {
        errors.push(validationResult.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean and normalize tags
   */
  static cleanTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 10); // Limit to 10 tags
  }

  /**
   * Validate image URLs
   */
  static validateImages(images: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    images.forEach(url => {
      try {
        new URL(url);
        valid.push(url);
      } catch {
        invalid.push(url);
      }
    });

    return { valid, invalid };
  }
}
```

### 4. Item Hooks
- [ ] Create: `src/common/hooks/useItems.ts` (under 150 lines)

```typescript
// src/common/hooks/useItems.ts
import { useState, useEffect, useCallback } from 'react';
import { ItemOperations } from '@/common/operations/itemOperations';
import type { 
  Item,
  ItemWithAttributes,
  ItemWithDetails,
  ItemCreationRequest,
  ItemUpdateRequest,
  ItemSearchFilters,
  ItemSearchResult
} from '@/types/item';

interface UseItemsReturn {
  items: ItemSearchResult[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchItems: (filters: ItemSearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useItems(initialFilters: ItemSearchFilters = {}): UseItemsReturn {
  const [items, setItems] = useState<ItemSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [offset, setOffset] = useState(0);

  const searchItems = useCallback(async (filters: ItemSearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setOffset(0);
      
      const results = await ItemOperations.searchItems(filters, 20, 0);
      setItems(results);
      setHasMore(results.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search items');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const newOffset = offset + 20;
      const results = await ItemOperations.searchItems(currentFilters, 20, newOffset);
      
      setItems(prev => [...prev, ...results]);
      setOffset(newOffset);
      setHasMore(results.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setLoading(false);
    }
  }, [currentFilters, offset, hasMore, loading]);

  const refetch = useCallback(async () => {
    await searchItems(currentFilters);
  }, [searchItems, currentFilters]);

  useEffect(() => {
    searchItems(initialFilters);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    searchItems,
    loadMore,
    refetch,
  };
}

interface UseItemReturn {
  item: ItemWithAttributes | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateItem: (data: ItemUpdateRequest) => Promise<void>;
  deleteItem: () => Promise<void>;
}

export function useItem(itemId: string | null): UseItemReturn {
  const [item, setItem] = useState<ItemWithAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      setItem(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ItemOperations.getItemById(itemId);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const updateItem = useCallback(async (data: ItemUpdateRequest) => {
    try {
      await ItemOperations.updateItem(data);
      await fetchItem(); // Refresh item
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setError(message);
      throw new Error(message);
    }
  }, [fetchItem]);

  const deleteItem = useCallback(async () => {
    if (!itemId) return;
    
    try {
      await ItemOperations.deleteItem(itemId);
      setItem(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setError(message);
      throw new Error(message);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    loading,
    error,
    refetch: fetchItem,
    updateItem,
    deleteItem,
  };
}

interface UseItemCreationReturn {
  createItem: (data: ItemCreationRequest) => Promise<Item>;
  loading: boolean;
  error: string | null;
}

export function useItemCreation(): UseItemCreationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = useCallback(async (data: ItemCreationRequest): Promise<Item> => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await ItemOperations.createItem(data);
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createItem,
    loading,
    error,
  };
}
```

## Success Criteria
- [ ] Enhanced item types support dynamic properties
- [ ] JSONB attribute validation working correctly
- [ ] Item search includes attribute filtering
- [ ] Item operations handle category-specific validation
- [ ] Performance optimized for complex queries
- [ ] All files under 150 lines with proper imports 