# Advanced Search & Filtering System

## Full-Text Search with Advanced Filtering

### 1. Advanced Search Engine
- [ ] Create: `src/common/operations/advancedSearchEngine.ts` (under 150 lines)

```typescript
// src/common/operations/advancedSearchEngine.ts
import { createClient } from '@/common/supabase/client';

interface SearchFilters {
  query?: string;
  categories?: number[];
  location?: string;
  condition?: string[];
  priceRange?: { min?: number; max?: number };
  availability?: boolean;
  owner?: string;
  tags?: string[];
  dateRange?: { start?: string; end?: string };
  sortBy?: 'relevance' | 'date' | 'name' | 'condition' | 'location';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  items: any[];
  totalCount: number;
  facets: {
    categories: { id: number; name: string; count: number }[];
    conditions: { value: string; count: number }[];
    locations: { value: string; count: number }[];
  };
  suggestions: string[];
  searchTime: number;
}

export class AdvancedSearchEngine {
  
  /**
   * Perform advanced search with filters and facets
   */
  static async search(
    filters: SearchFilters,
    limit = 20,
    offset = 0
  ): Promise<SearchResult> {
    const startTime = performance.now();
    
    // Build main search query
    let query = supabase
      .from('items')
      .select(`
        id,
        name,
        description,
        condition,
        images,
        location,
        is_available,
        created_at,
        external_category_id,
        tags,
        attributes,
        external_product_taxonomy:external_category_id (
          category_path
        ),
        profiles:owner_id (
          id,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_public', true);

    // Apply text search with ranking
    if (filters.query) {
      query = query.textSearch('search_vector', filters.query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply filters
    if (filters.categories?.length) {
      query = query.in('external_category_id', filters.categories);
    }

    if (filters.condition?.length) {
      query = query.in('condition', filters.condition);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.availability !== undefined) {
      query = query.eq('is_available', filters.availability);
    }

    if (filters.owner) {
      query = query.eq('owner_id', filters.owner);
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.dateRange?.start) {
      query = query.gte('created_at', filters.dateRange.start);
    }

    if (filters.dateRange?.end) {
      query = query.lte('created_at', filters.dateRange.end);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'relevance';
    const sortOrder = filters.sortOrder || 'desc';
    
    if (sortBy === 'relevance' && filters.query) {
      // Use built-in text search ranking
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else {
      const orderColumn = this.getSortColumn(sortBy);
      query = query.order(orderColumn, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, error, count } = await query;
    
    if (error) throw error;

    // Get facets for filtering UI
    const facets = await this.getFacets(filters);
    
    // Get search suggestions
    const suggestions = filters.query ? await this.getSearchSuggestions(filters.query) : [];

    const searchTime = performance.now() - startTime;

    return {
      items: items || [],
      totalCount: count || 0,
      facets,
      suggestions,
      searchTime
    };
  }

  /**
   * Get facets for filter UI
   */
  private static async getFacets(filters: SearchFilters) {
    // Get category facets
    const { data: categoryFacets } = await supabase
      .from('items')
      .select(`
        external_category_id,
        external_product_taxonomy:external_category_id (category_path)
      `)
      .eq('is_public', true);

    // Get condition facets
    const { data: conditionFacets } = await supabase
      .from('items')
      .select('condition')
      .eq('is_public', true);

    // Get location facets
    const { data: locationFacets } = await supabase
      .from('items')
      .select('location')
      .eq('is_public', true)
      .not('location', 'is', null);

    // Process facets
    const categories = this.processCategoryFacets(categoryFacets || []);
    const conditions = this.processConditionFacets(conditionFacets || []);
    const locations = this.processLocationFacets(locationFacets || []);

    return { categories, conditions, locations };
  }

  /**
   * Get search suggestions based on query
   */
  private static async getSearchSuggestions(query: string): Promise<string[]> {
    const words = query.toLowerCase().split(' ').filter(w => w.length > 2);
    if (words.length === 0) return [];

    // Get suggestions from item names
    const { data } = await supabase
      .from('items')
      .select('name')
      .textSearch('name', words[0])
      .limit(5);

    const suggestions = (data || [])
      .map(item => item.name.toLowerCase())
      .filter(name => name.includes(words[0]) && name !== query.toLowerCase());

    return Array.from(new Set(suggestions)).slice(0, 3);
  }

  /**
   * Save search for user
   */
  static async saveSearch(
    userId: string,
    name: string,
    filters: SearchFilters
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          name,
          filters,
          created_at: new Date().toISOString()
        });

      return error ? { success: false, error: error.message } : { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get saved searches for user
   */
  static async getSavedSearches(userId: string) {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Track search analytics
   */
  static async trackSearch(
    query: string,
    filters: SearchFilters,
    resultsCount: number,
    userId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('search_analytics')
        .insert({
          query,
          filters,
          results_count: resultsCount,
          user_id: userId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  /**
   * Get search column for sorting
   */
  private static getSortColumn(sortBy: string): string {
    switch (sortBy) {
      case 'date': return 'created_at';
      case 'name': return 'name';
      case 'condition': return 'condition';
      case 'location': return 'location';
      default: return 'created_at';
    }
  }

  /**
   * Process category facets
   */
  private static processCategoryFacets(data: any[]) {
    const categoryMap = new Map();
    
    data.forEach(item => {
      if (item.external_product_taxonomy) {
        const key = item.external_category_id;
        const name = item.external_product_taxonomy.category_path;
        
        if (categoryMap.has(key)) {
          categoryMap.get(key).count++;
        } else {
          categoryMap.set(key, { id: key, name, count: 1 });
        }
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Process condition facets
   */
  private static processConditionFacets(data: any[]) {
    const conditionMap = new Map();
    
    data.forEach(item => {
      const condition = item.condition;
      if (condition) {
        if (conditionMap.has(condition)) {
          conditionMap.get(condition).count++;
        } else {
          conditionMap.set(condition, { value: condition, count: 1 });
        }
      }
    });

    return Array.from(conditionMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Process location facets
   */
  private static processLocationFacets(data: any[]) {
    const locationMap = new Map();
    
    data.forEach(item => {
      const location = item.location?.split(',')[0]?.trim(); // Get city part
      if (location) {
        if (locationMap.has(location)) {
          locationMap.get(location).count++;
        } else {
          locationMap.set(location, { value: location, count: 1 });
        }
      }
    });

    return Array.from(locationMap.values()).sort((a, b) => b.count - a.count);
  }
}
```

### 2. Advanced Search Interface
- [ ] Create: `src/app/tools/browse/components/AdvancedSearchInterface.tsx` (under 150 lines)

```tsx
// src/app/tools/browse/components/AdvancedSearchInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/primitives/input';
import { Button } from '@/primitives/button';
import { Select } from '@/primitives/select';
import { Checkbox } from '@/primitives/checkbox';
import { Badge } from '@/primitives/badge';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  BookmarkIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { AdvancedSearchEngine } from '@/common/operations/advancedSearchEngine';

interface Props {
  onSearch: (filters: any) => void;
  facets: {
    categories: { id: number; name: string; count: number }[];
    conditions: { value: string; count: number }[];
    locations: { value: string; count: number }[];
  };
  loading?: boolean;
}

export function AdvancedSearchInterface({ onSearch, facets, loading }: Props) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleSearch = () => {
    const filters = {
      query: query.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      condition: selectedConditions.length > 0 ? selectedConditions : undefined,
      location: selectedLocation || undefined,
      sortBy,
      sortOrder
    };

    onSearch(filters);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedLocation('');
    setSortBy('relevance');
    setSortOrder('desc');
  };

  const getActiveFilterCount = () => {
    return (
      (query ? 1 : 0) +
      selectedCategories.length +
      selectedConditions.length +
      (selectedLocation ? 1 : 0)
    );
  };

  // Auto-search when filters change
  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [query, selectedCategories, selectedConditions, selectedLocation, sortBy, sortOrder]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tools, equipment, or anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="primary" size="sm">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowSaveModal(true)}
          disabled={getActiveFilterCount() === 0}
        >
          <BookmarkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {query && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>"{query}"</span>
              <button onClick={() => setQuery('')}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCategories.map(categoryId => {
            const category = facets.categories.find(c => c.id === categoryId);
            return category ? (
              <Badge key={categoryId} variant="outline" className="flex items-center space-x-1">
                <span>{category.name.split(' > ').pop()}</span>
                <button onClick={() => handleCategoryToggle(categoryId)}>
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}

          {selectedConditions.map(condition => (
            <Badge key={condition} variant="outline" className="flex items-center space-x-1">
              <span className="capitalize">{condition}</span>
              <button onClick={() => handleConditionToggle(condition)}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedLocation && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>{selectedLocation}</span>
              <button onClick={() => setSelectedLocation('')}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {facets.categories.slice(0, 10).map(category => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {category.name.split(' > ').pop()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {category.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Condition</h4>
              <div className="space-y-2">
                {facets.conditions.map(condition => (
                  <label key={condition.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedConditions.includes(condition.value)}
                      onChange={() => handleConditionToggle(condition.value)}
                    />
                    <span className="text-sm text-gray-700 capitalize flex-1">
                      {condition.value}
                    </span>
                    <span className="text-xs text-gray-500">
                      {condition.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location & Sort */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                <Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All locations</option>
                  {facets.locations.slice(0, 10).map(location => (
                    <option key={location.value} value={location.value}>
                      {location.value} ({location.count})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sort by</h4>
                <div className="space-y-2">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date added</option>
                    <option value="name">Name</option>
                    <option value="condition">Condition</option>
                  </Select>
                  
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Implementation Checklist
- [ ] Advanced search engine with full-text search and ranking
- [ ] Dynamic filtering interface with faceted search
- [ ] Saved searches functionality for users
- [ ] Search analytics and tracking
- [ ] Auto-complete and search suggestions
- [ ] Advanced sorting and filtering options
- [ ] Search result highlighting
- [ ] Search performance optimization
- [ ] Mobile-responsive search interface
- [ ] Search history and recent searches
- [ ] Elasticsearch integration for advanced features
- [ ] Search result export functionality
- [ ] Search API rate limiting
- [ ] Advanced query operators (AND, OR, NOT)
- [ ] Geospatial search capabilities 