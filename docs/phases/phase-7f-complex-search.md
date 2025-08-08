# Phase 7f: Complex Search and Browse Pages

## 🎯 Objective
Handle the most complex pages with advanced search, filtering, and state management, converting them to server components while preserving complex interactive features.

---

## 📋 Target Files (2 pages - if they exist beyond what's already covered)

### Analysis Required: Check if Additional Search Pages Exist

**Sub-tasks:**
- [ ] Verify if there are additional search/browse pages beyond those already covered in Phase 7b
- [ ] Check for advanced search pages in admin sections
- [ ] Identify any complex filtering pages that need conversion
- [ ] Review any marketplace or discovery pages

### Potential Additional Pages (if they exist):

### 1. Advanced Search Page (if exists)
**Location:** `src/app/(app)/search/page.tsx` or similar
**Complexity:** ⭐⭐⭐⭐ Very High (complex search, multiple filters, faceted search)
**Estimated Time:** 2.5 hours

**Sub-tasks (if page exists):**
- [ ] Analyze current advanced search implementation
- [ ] Create `src/app/(app)/search/getAdvancedSearchResults.ts` server function
- [ ] Handle complex search parameters and filters
- [ ] Convert page to server component with search params
- [ ] Create `components/AdvancedSearchForm` client component
- [ ] Create `components/SearchResults` UI component
- [ ] Create `components/SearchFacets` client component
- [ ] Implement URL-based state management for all filters
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update search analytics and tracking
- [ ] Run `task validate` and fix any issues

### 2. Marketplace/Discovery Page (if exists)
**Location:** `src/app/(app)/discover/page.tsx` or similar
**Complexity:** ⭐⭐⭐⭐ Very High (recommendations, trending, complex algorithms)
**Estimated Time:** 2.5 hours

**Sub-tasks (if page exists):**
- [ ] Analyze current discovery/recommendation logic
- [ ] Create `src/app/(app)/discover/getDiscoveryData.ts` server function
- [ ] Implement server-side recommendation algorithms
- [ ] Convert page to server component
- [ ] Create `components/TrendingTools` UI component
- [ ] Create `components/RecommendedTools` UI component
- [ ] Create `components/DiscoveryFilters` client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update recommendation tracking
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Advanced Search Server Function (if needed)

```typescript
// src/app/(app)/search/getAdvancedSearchResults.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

interface AdvancedSearchParams {
  query?: string;
  categories?: string[];
  availability?: string[];
  location?: string;
  priceRange?: { min?: number; max?: number };
  rating?: number;
  distance?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getAdvancedSearchResults(searchParams: AdvancedSearchParams) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // Build complex query with multiple filters
  let query = supabase
    .from('items')
    .select(`
      *,
      categories(id, name, slug),
      profiles!items_owner_id_fkey(
        id,
        name,
        avatar_url,
        location,
        rating
      ),
      reviews(rating)
    `, { count: 'exact' });
  
  // Text search
  if (searchParams.query) {
    query = query.or(
      `name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`
    );
  }
  
  // Category filters
  if (searchParams.categories?.length) {
    query = query.in('category_id', searchParams.categories);
  }
  
  // Availability filters
  if (searchParams.availability?.length) {
    query = query.in('availability_status', searchParams.availability);
  }
  
  // Location filter (simplified - would need proper geo queries)
  if (searchParams.location) {
    query = query.ilike('profiles.location', `%${searchParams.location}%`);
  }
  
  // Price range filter
  if (searchParams.priceRange?.min !== undefined) {
    query = query.gte('daily_rate', searchParams.priceRange.min);
  }
  if (searchParams.priceRange?.max !== undefined) {
    query = query.lte('daily_rate', searchParams.priceRange.max);
  }
  
  // Rating filter (would need aggregation)
  if (searchParams.rating) {
    // This would require a more complex query with aggregated ratings
    // For now, simplified implementation
    query = query.gte('profiles.rating', searchParams.rating);
  }
  
  // Sorting
  const sortBy = searchParams.sortBy || 'created_at';
  const sortOrder = searchParams.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Pagination
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 20;
  const offset = (page - 1) * limit;
  
  const { data: items, error, count } = await query
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  
  // Get search facets for filtering UI
  const [categoryFacets, availabilityFacets, locationFacets] = await Promise.all([
    supabase.from('categories').select('id, name').order('name'),
    supabase.from('items').select('availability_status').not('availability_status', 'is', null),
    supabase.from('profiles').select('location').not('location', 'is', null)
  ]);
  
  // Process facets
  const availabilityOptions = [...new Set(availabilityFacets.data?.map(item => item.availability_status))];
  const locationOptions = [...new Set(locationFacets.data?.map(profile => profile.location))];
  
  return {
    items: items || [],
    facets: {
      categories: categoryFacets.data || [],
      availability: availabilityOptions,
      locations: locationOptions
    },
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}
```

### Discovery/Recommendation Server Function (if needed)

```typescript
// src/app/(app)/discover/getDiscoveryData.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getDiscoveryData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get trending tools (most borrowed recently)
  const { data: trendingTools, error: trendingError } = await supabase
    .from('items')
    .select(`
      *,
      categories(name),
      profiles!items_owner_id_fkey(name, avatar_url),
      loans(created_at)
    `)
    .gte('loans.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('loans(count)', { ascending: false })
    .limit(12);
    
  if (trendingError) throw trendingError;
  
  // Get recently added tools
  const { data: recentTools, error: recentError } = await supabase
    .from('items')
    .select(`
      *,
      categories(name),
      profiles!items_owner_id_fkey(name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(8);
    
  if (recentError) throw recentError;
  
  // Get recommended tools (simplified - would use ML/AI in production)
  let recommendedTools = [];
  if (user) {
    // Get user's borrowing history to recommend similar tools
    const { data: userLoans } = await supabase
      .from('loans')
      .select(`
        items(category_id)
      `)
      .eq('borrower_id', user.id);
      
    const userCategories = [...new Set(userLoans?.map(loan => loan.items?.category_id).filter(Boolean))];
    
    if (userCategories.length > 0) {
      const { data: recommended } = await supabase
        .from('items')
        .select(`
          *,
          categories(name),
          profiles!items_owner_id_fkey(name, avatar_url)
        `)
        .in('category_id', userCategories)
        .neq('owner_id', user.id) // Don't recommend user's own tools
        .order('created_at', { ascending: false })
        .limit(8);
        
      recommendedTools = recommended || [];
    }
  }
  
  // Get featured categories
  const { data: featuredCategories, error: categoriesError } = await supabase
    .from('categories')
    .select(`
      *,
      items(count)
    `)
    .order('items(count)', { ascending: false })
    .limit(6);
    
  if (categoriesError) throw categoriesError;
  
  return {
    trendingTools: trendingTools || [],
    recentTools: recentTools || [],
    recommendedTools,
    featuredCategories: featuredCategories || []
  };
}
```

### Page Implementation Examples

```typescript
// src/app/(app)/search/page.tsx (if exists)
import { getAdvancedSearchResults } from './getAdvancedSearchResults';
import { AdvancedSearchForm } from './components/AdvancedSearchForm';
import { SearchResults } from './components/SearchResults';
import { SearchFacets } from './components/SearchFacets';

interface SearchPageProps {
  searchParams: {
    query?: string;
    categories?: string;
    availability?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    distance?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

export default async function AdvancedSearchPage({ searchParams }: SearchPageProps) {
  const params = {
    query: searchParams.query,
    categories: searchParams.categories?.split(',').filter(Boolean),
    availability: searchParams.availability?.split(',').filter(Boolean),
    location: searchParams.location,
    priceRange: {
      min: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
      max: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined
    },
    rating: searchParams.rating ? parseInt(searchParams.rating) : undefined,
    distance: searchParams.distance ? parseInt(searchParams.distance) : undefined,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
    page: searchParams.page ? parseInt(searchParams.page) : 1
  };
  
  const { items, facets, pagination } = await getAdvancedSearchResults(params);
  
  return (
    <div className="advanced-search-layout">
      <div className="search-header">
        <h1>Advanced Search</h1>
        <AdvancedSearchForm facets={facets} />
      </div>
      
      <div className="search-content">
        <aside className="search-sidebar">
          <SearchFacets facets={facets} />
        </aside>
        
        <main className="search-results">
          <SearchResults 
            items={items} 
            pagination={pagination}
            totalResults={pagination.total}
          />
        </main>
      </div>
    </div>
  );
}
```

---

## ✅ Verification Checklist

### Discovery Verification
- [ ] Confirmed which complex search pages actually exist
- [ ] Identified all pages that need advanced search conversion
- [ ] Analyzed current search and discovery implementations

### Implementation Verification (if pages exist)
- [ ] Advanced search server functions created
- [ ] Discovery/recommendation server functions created
- [ ] All pages converted to server components
- [ ] Complex filtering moved to URL-based state
- [ ] Search facets and filters working correctly

### Functionality Verification
- [ ] Advanced search with multiple filters works
- [ ] Discovery and recommendation logic preserved
- [ ] URL-based state management for all filters
- [ ] Search analytics and tracking preserved
- [ ] Performance optimized for complex queries
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ All complex search pages identified and converted
- ✅ Advanced search functionality preserved
- ✅ Recommendation algorithms moved to server-side
- ✅ Complex filtering handled with URL state
- ✅ Search performance optimized
- ✅ All interactive features preserved as client components
- ✅ Proper error handling and loading states
- ✅ `task validate` passes without errors

---

## 📝 Note

This phase may have limited scope if most complex search functionality was already covered in Phase 7b (Browse Tools). The main focus should be on identifying any additional complex search or discovery pages that exist beyond the core tool browsing functionality.

---

*Phase 7f handles the most complex search and discovery features, ensuring that advanced functionality is properly converted while maintaining performance and user experience.*
