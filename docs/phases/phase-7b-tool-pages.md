# Phase 7b: Tool Pages Data Extraction

## 🎯 Objective
Convert tool-related pages from client-side data fetching to server components, focusing on the core tool functionality that is central to the application.

---

## 📋 Target Files (4 pages)

### 1. `src/app/(app)/tools/tools/page.tsx` - User's Tools List
**Current State:** Uses ToolDataProcessor.getUserTools() with client-side state
**Complexity:** ⭐⭐ Medium (user-specific data)
**Estimated Time:** 1 hour

**Sub-tasks:**
- [ ] Analyze current ToolDataProcessor usage
- [ ] Create `src/app/(app)/tools/tools/getUserTools.ts` server function
- [ ] Convert page from client to server component
- [ ] Create `components/ToolsList` UI component
- [ ] Create `components/EmptyToolsState` UI component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Remove useState/useEffect/useAuth dependencies
- [ ] Update all import statements
- [ ] Run `task validate` and fix any issues

### 2. `src/app/(app)/tools/tools/add/page.tsx` - Add New Tool
**Current State:** Form page with category suggestions and validation
**Complexity:** ⭐⭐⭐ High (form handling, real-time suggestions)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current form state and data fetching
- [ ] Create `src/app/(app)/tools/tools/add/getAddToolData.ts` server function
- [ ] Keep form as client component (needs interactivity)
- [ ] Convert page wrapper to server component
- [ ] Create server function for initial form data (categories, etc.)
- [ ] Separate client-side interactivity from data fetching
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update category suggestions to use server function
- [ ] Run `task validate` and fix any issues

### 3. `src/app/(app)/tools/tools/browse/page.tsx` - Browse All Tools
**Current State:** Complex search with filters, pagination, client-side state
**Complexity:** ⭐⭐⭐⭐ Very High (search, filters, pagination)
**Estimated Time:** 2 hours

**Sub-tasks:**
- [ ] Analyze current search logic and state management
- [ ] Create `src/app/(app)/tools/tools/browse/getSearchResults.ts` server function
- [ ] Handle URL search params in server function
- [ ] Convert page to server component with search params
- [ ] Create `components/ToolSearchResults` UI component
- [ ] Create `components/SearchFilters` client component
- [ ] Create `components/PaginationControls` client component
- [ ] Implement URL-based state management
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update search hooks to work with server-side data
- [ ] Run `task validate` and fix any issues

### 4. `src/app/(app)/tools/tools/[id]/page.tsx` - Tool Details
**Current State:** Dynamic route with tool details and related data
**Complexity:** ⭐⭐⭐ High (dynamic route, multiple data sources)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current tool details data fetching
- [ ] Create `src/app/(app)/tools/tools/[id]/getToolDetails.ts` server function
- [ ] Handle tool not found with Next.js notFound()
- [ ] Convert page to server component
- [ ] Create `components/ToolDetails` UI component
- [ ] Create `components/ToolActions` client component (for interactions)
- [ ] Create `components/RelatedTools` UI component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update loan request functionality
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Server Function Examples

```typescript
// src/app/(app)/tools/tools/getUserTools.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getUserTools() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: tools, error } = await supabase
    .from('items')
    .select(`
      *,
      categories(name, slug),
      profiles!items_owner_id_fkey(name, avatar_url)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return tools || [];
}
```

```typescript
// src/app/(app)/tools/tools/browse/getSearchResults.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

interface SearchParams {
  query?: string;
  category?: string;
  availability?: string;
  page?: number;
}

export async function getSearchResults(searchParams: SearchParams) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  let query = supabase
    .from('items')
    .select(`
      *,
      categories(name, slug),
      profiles!items_owner_id_fkey(name, avatar_url)
    `, { count: 'exact' });
    
  // Apply filters
  if (searchParams.query) {
    query = query.ilike('name', `%${searchParams.query}%`);
  }
  
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category);
  }
  
  if (searchParams.availability) {
    query = query.eq('availability_status', searchParams.availability);
  }
  
  // Pagination
  const page = searchParams.page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  const { data: tools, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return {
    tools: tools || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}
```

```typescript
// src/app/(app)/tools/tools/[id]/getToolDetails.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function getToolDetails(id: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: tool, error } = await supabase
    .from('items')
    .select(`
      *,
      categories(name, slug),
      profiles!items_owner_id_fkey(name, avatar_url, email),
      loans(
        id,
        status,
        start_date,
        end_date,
        profiles!loans_borrower_id_fkey(name)
      )
    `)
    .eq('id', id)
    .single();
    
  if (error || !tool) {
    notFound();
  }
  
  // Get related tools
  const { data: relatedTools } = await supabase
    .from('items')
    .select(`
      id,
      name,
      image_url,
      categories(name)
    `)
    .eq('category_id', tool.category_id)
    .neq('id', id)
    .limit(4);
  
  return {
    tool,
    relatedTools: relatedTools || []
  };
}
```

### Page Conversion Examples

```typescript
// Before: src/app/(app)/tools/tools/page.tsx
'use client';
import { useAuth } from '@/common/supabase/hooks/useAuth';
import { ToolDataProcessor } from '@/common/operations/toolDataProcessor';

export default function ToolsPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadUserTools();
    }
  }, [user]);
  
  // ... rest of client logic
}

// After: src/app/(app)/tools/tools/page.tsx
import { getUserTools } from './getUserTools';
import { ToolsList } from './components/ToolsList';

export default async function ToolsPage() {
  const tools = await getUserTools();
  
  return (
    <div>
      <h1>My Tools</h1>
      <ToolsList tools={tools} />
    </div>
  );
}
```

```typescript
// src/app/(app)/tools/tools/browse/page.tsx
import { getSearchResults } from './getSearchResults';
import { ToolSearchResults } from './components/ToolSearchResults';
import { SearchFilters } from './components/SearchFilters';

interface BrowsePageProps {
  searchParams: {
    query?: string;
    category?: string;
    availability?: string;
    page?: string;
  };
}

export default async function BrowseToolsPage({ searchParams }: BrowsePageProps) {
  const params = {
    query: searchParams.query,
    category: searchParams.category,
    availability: searchParams.availability,
    page: searchParams.page ? parseInt(searchParams.page) : 1
  };
  
  const { tools, pagination } = await getSearchResults(params);
  
  return (
    <div>
      <h1>Browse Tools</h1>
      <SearchFilters />
      <ToolSearchResults tools={tools} pagination={pagination} />
    </div>
  );
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `getUserTools.ts` server function created
- [ ] `getAddToolData.ts` server function created
- [ ] `getSearchResults.ts` server function created
- [ ] `getToolDetails.ts` server function created
- [ ] All 4 pages converted to server components
- [ ] All 8 error.tsx and loading.tsx files created
- [ ] UI components extracted from pages

### Functionality Verification
- [ ] User tools list loads correctly
- [ ] Add tool form has initial data from server
- [ ] Browse page search and filters work with URL params
- [ ] Tool details page loads with related tools
- [ ] Dynamic routes handle not found correctly
- [ ] Error boundaries trigger appropriately
- [ ] Loading states display during navigation

### Code Quality Verification
- [ ] No client-side data fetching in pages
- [ ] Server functions handle errors properly
- [ ] Authentication checks in server functions
- [ ] URL state management for search/filters
- [ ] TypeScript interfaces defined
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 4 tool pages converted to server components
- ✅ 4 server data fetching functions created
- ✅ Search and filtering moved to URL-based state
- ✅ Dynamic routes properly handle not found
- ✅ All client-side data fetching removed from pages
- ✅ Interactive features preserved as client components
- ✅ Proper error handling and loading states
- ✅ All functionality preserved
- ✅ `task validate` passes without errors

---

*Phase 7b tackles the core tool functionality, establishing patterns for complex data fetching, search, and dynamic routes.*
