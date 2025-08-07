# Phase 7: Extract Data Fetching from Pages

## 🎯 Objective
Extract all business logic and data fetching from page components, ensuring pages only contain UI orchestration while moving data fetching to dedicated server functions.

---

## 🚨 Current State Analysis

**Problem:** Pages contain business logic and data fetching instead of focusing on UI orchestration
```
src/app/tools/page.tsx → Contains ToolDataProcessor.getUserTools()
src/app/dashboard/page.tsx → Contains client-side data fetching
src/app/admin/users/page.tsx → Contains user management logic
src/app/loans/page.tsx → Contains loan processing logic
```

**Impact:**
- Pages are bloated with business logic
- Difficult to test UI components in isolation
- Poor separation of concerns
- Client-side data fetching instead of server-side
- Performance issues from client-side data processing

---

## 🚀 Step-by-Step Implementation

### Step 1: Identify Pages with Business Logic

**Analyze all pages to identify those containing business logic:**

```bash
# Pages that need data fetching extraction
src/app/(app)/tools/page.tsx
src/app/(app)/dashboard/page.tsx
src/app/(app)/loans/page.tsx
src/app/(app)/social/page.tsx
src/app/admin/users/page.tsx
src/app/admin/categories/page.tsx
src/app/admin/attributes/page.tsx
src/app/(app)/tools/browse/page.tsx
src/app/(app)/tools/add/page.tsx
src/app/(app)/tools/[id]/page.tsx
```

### Step 2: Create Server-Side Data Fetching Functions

**Create dedicated server functions for each page's data needs:**

```typescript
// src/app/(app)/tools/getTools.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getTools() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: tools, error } = await supabase
    .from('items')
    .select(`
      *,
      categories(name),
      profiles!items_owner_id_fkey(name, avatar_url)
    `)
    .eq('owner_id', user.id);
    
  if (error) throw error;
  return tools;
}
```

```typescript
// src/app/(app)/dashboard/getDashboardData.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getDashboardData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Fetch dashboard statistics
  const [toolsCount, loansCount, activeLoansCount] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact' }).eq('owner_id', user.id),
    supabase.from('loans').select('id', { count: 'exact' }).eq('borrower_id', user.id),
    supabase.from('loans').select('id', { count: 'exact' }).eq('borrower_id', user.id).eq('status', 'active')
  ]);
  
  return {
    toolsCount: toolsCount.count || 0,
    loansCount: loansCount.count || 0,
    activeLoansCount: activeLoansCount.count || 0
  };
}
```

```typescript
// src/app/admin/users/getUsers.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getUsers() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Check admin permissions
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (userRole?.role !== 'admin') throw new Error('Insufficient permissions');
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(role)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return users;
}
```

### Step 3: Refactor Pages to Use Server Functions

**Convert pages to use server-side data fetching:**

```typescript
// Before: src/app/(app)/tools/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { ToolDataProcessor } from '@/common/operations/toolDataProcessor';

export default function ToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadTools() {
      const toolsData = await ToolDataProcessor.getUserTools();
      setTools(toolsData);
      setLoading(false);
    }
    loadTools();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {tools.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

```typescript
// After: src/app/(app)/tools/page.tsx
import { getTools } from './getTools';
import { ToolsList } from './components/ToolsList';

export default async function ToolsPage() {
  const tools = await getTools();
  
  return (
    <div>
      <h1>My Tools</h1>
      <ToolsList tools={tools} />
    </div>
  );
}
```

### Step 4: Create UI-Only Components

**Extract UI logic into dedicated components:**

```typescript
// src/app/(app)/tools/components/ToolsList/index.tsx
import { ToolCard } from './ToolCard';

interface ToolsListProps {
  tools: Tool[];
}

export function ToolsList({ tools }: ToolsListProps) {
  if (!tools.length) {
    return (
      <div className="empty-state">
        <p>No tools found. Add your first tool to get started!</p>
      </div>
    );
  }
  
  return (
    <div className="tools-grid">
      {tools.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

```typescript
// src/app/(app)/dashboard/components/DashboardStats/index.tsx
interface DashboardStatsProps {
  stats: {
    toolsCount: number;
    loansCount: number;
    activeLoansCount: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="stats-grid">
      <StatsCard title="My Tools" value={stats.toolsCount} />
      <StatsCard title="Total Loans" value={stats.loansCount} />
      <StatsCard title="Active Loans" value={stats.activeLoansCount} />
    </div>
  );
}
```

### Step 5: Handle Error Boundaries

**Add proper error handling for server functions:**

```typescript
// src/app/(app)/tools/error.tsx
'use client';

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

```typescript
// src/app/(app)/tools/loading.tsx
export default function ToolsLoading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p>Loading your tools...</p>
    </div>
  );
}
```

### Step 6: Extract Search and Filter Logic

**Move search and filter logic to dedicated functions:**

```typescript
// src/app/(app)/tools/browse/getSearchResults.ts
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
      categories(name),
      profiles!items_owner_id_fkey(name, avatar_url)
    `);
    
  if (searchParams.query) {
    query = query.ilike('name', `%${searchParams.query}%`);
  }
  
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category);
  }
  
  if (searchParams.availability) {
    query = query.eq('availability_status', searchParams.availability);
  }
  
  const page = searchParams.page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  const { data: tools, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return {
    tools,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}
```

### Step 7: Update Dynamic Routes

**Handle dynamic routes with server-side data fetching:**

```typescript
// src/app/(app)/tools/[id]/getToolDetails.ts
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
      categories(name),
      profiles!items_owner_id_fkey(name, avatar_url, email),
      loans(
        id,
        status,
        borrower_id,
        profiles!loans_borrower_id_fkey(name)
      )
    `)
    .eq('id', id)
    .single();
    
  if (error || !tool) {
    notFound();
  }
  
  return tool;
}
```

```typescript
// src/app/(app)/tools/[id]/page.tsx
import { getToolDetails } from './getToolDetails';
import { ToolDetails } from './components/ToolDetails';

interface ToolPageProps {
  params: { id: string };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const tool = await getToolDetails(params.id);
  
  return (
    <div>
      <ToolDetails tool={tool} />
    </div>
  );
}
```

### Step 8: Remove Client-Side Data Fetching

**Remove all client-side data fetching from pages:**

```bash
# Remove these patterns from all pages:
# - useEffect with data fetching
# - useState for data storage
# - Client-side API calls
# - Business logic in components

# Replace with:
# - Server-side data fetching
# - Props passed to components
# - UI-only components
```

---

## 📋 Verification Checklist

### ✅ Data Fetching Extraction Verification

- [ ] All pages converted to server components
- [ ] Business logic moved to dedicated server functions
- [ ] No client-side data fetching in pages
- [ ] Proper error boundaries implemented
- [ ] Loading states handled with loading.tsx
- [ ] Dynamic routes properly handled
- [ ] Search and filter logic extracted to server functions

### ✅ Component Structure Verification

- [ ] Pages only contain UI orchestration
- [ ] UI components receive data via props
- [ ] Components are pure and predictable
- [ ] No business logic in UI components
- [ ] Proper TypeScript interfaces defined
- [ ] Components are properly typed

### ✅ Performance Verification

- [ ] Run `task validate` to ensure server-side rendering working correctly
- [ ] No client-side data fetching
- [ ] Proper caching implemented
- [ ] No unnecessary re-renders
- [ ] Fast page load times
- [ ] SEO-friendly server-side rendering

### ✅ Error Handling Verification

- [ ] Proper error boundaries in place
- [ ] Graceful error handling in server functions
- [ ] User-friendly error messages
- [ ] Proper HTTP status codes
- [ ] Error logging implemented

---

## 🎯 Success Criteria

- ✅ All pages converted to server components
- ✅ Business logic extracted to dedicated server functions
- ✅ No client-side data fetching in pages
- ✅ Proper error handling and loading states
- ✅ UI components are pure and predictable
- ✅ Server-side rendering working correctly
- ✅ Performance improved through server-side data fetching
- ✅ SEO-friendly pages with proper metadata
- ✅ Run `task validate` to ensure no breaking changes

---

## 🚨 Common Issues and Solutions

### Issue: Client-Side Dependencies
**Problem:** Components require client-side features (useState, useEffect)
**Solution:**
- Split components into server and client parts
- Use 'use client' directive only where necessary
- Pass data down through props to client components

### Issue: Authentication in Server Components
**Problem:** Server components need to handle authentication
**Solution:**
- Use server-side authentication checks
- Redirect unauthenticated users
- Handle auth state in server functions

### Issue: Dynamic Data Updates
**Problem:** Server components don't update automatically
**Solution:**
- Use Next.js revalidation
- Implement proper caching strategies
- Use client components for real-time updates where needed

### Issue: Complex State Management
**Problem:** Moving from client state to server state
**Solution:**
- Use URL state for filters and search
- Implement proper form handling
- Use optimistic updates where appropriate

---

## 📚 Additional Resources

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023)

---

*Phase 7 focuses on extracting all business logic and data fetching from pages, ensuring they only contain UI orchestration while moving data fetching to dedicated server functions for better performance and maintainability.*
