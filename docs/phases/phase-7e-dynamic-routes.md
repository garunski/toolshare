# Phase 7e: Dynamic Routes Data Extraction

## 🎯 Objective
Convert remaining dynamic route pages from client-side data fetching to server components, focusing on proper handling of route parameters and not found cases.

---

## 📋 Target Files (2 pages)

### 1. `src/app/(app)/loans/loans/page.tsx` - User Loans List
**Current State:** User's loan history with client-side fetching
**Complexity:** ⭐⭐⭐ High (user-specific data, loan states)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current loan data fetching and state management
- [ ] Create `src/app/(app)/loans/loans/getUserLoans.ts` server function
- [ ] Convert page to server component
- [ ] Create `components/LoansList` UI component
- [ ] Create `components/LoanStatusFilter` client component
- [ ] Create `components/LoanActions` client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update loan status management functionality
- [ ] Run `task validate` and fix any issues

### 2. `src/app/(app)/tools/tools/[id]/edit/page.tsx` - Edit Tool (if exists)
**Current State:** Dynamic route for editing tools
**Complexity:** ⭐⭐⭐⭐ Very High (dynamic route, form handling, ownership validation)
**Estimated Time:** 2 hours

**Sub-tasks:**
- [ ] Check if this page exists in the codebase
- [ ] If exists, analyze current tool editing logic
- [ ] Create `src/app/(app)/tools/tools/[id]/edit/getEditToolData.ts` server function
- [ ] Add ownership validation in server function
- [ ] Handle tool not found with Next.js notFound()
- [ ] Convert page wrapper to server component
- [ ] Keep form as client component (needs interactivity)
- [ ] Create server function for initial form data
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update tool editing functionality
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Server Function Examples

```typescript
// src/app/(app)/loans/loans/getUserLoans.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getUserLoans() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Get loans where user is borrower
  const { data: borrowedLoans, error: borrowedError } = await supabase
    .from('loans')
    .select(`
      *,
      items(
        id,
        name,
        image_url,
        profiles!items_owner_id_fkey(name, avatar_url)
      ),
      profiles!loans_borrower_id_fkey(name, avatar_url)
    `)
    .eq('borrower_id', user.id)
    .order('created_at', { ascending: false });
    
  if (borrowedError) throw borrowedError;
  
  // Get loans where user is lender (owns the tools)
  const { data: lentLoans, error: lentError } = await supabase
    .from('loans')
    .select(`
      *,
      items!inner(
        id,
        name,
        image_url,
        owner_id
      ),
      profiles!loans_borrower_id_fkey(name, avatar_url)
    `)
    .eq('items.owner_id', user.id)
    .order('created_at', { ascending: false });
    
  if (lentError) throw lentError;
  
  // Get loan statistics
  const [activeCount, completedCount, pendingCount] = await Promise.all([
    supabase.from('loans').select('id', { count: 'exact' }).eq('borrower_id', user.id).eq('status', 'active'),
    supabase.from('loans').select('id', { count: 'exact' }).eq('borrower_id', user.id).eq('status', 'completed'),
    supabase.from('loans').select('id', { count: 'exact' }).eq('borrower_id', user.id).eq('status', 'pending')
  ]);
  
  return {
    borrowedLoans: borrowedLoans || [],
    lentLoans: lentLoans || [],
    stats: {
      active: activeCount.count || 0,
      completed: completedCount.count || 0,
      pending: pendingCount.count || 0
    }
  };
}
```

```typescript
// src/app/(app)/tools/tools/[id]/edit/getEditToolData.ts (if this page exists)
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

export async function getEditToolData(toolId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  
  // Get the tool with ownership check
  const { data: tool, error: toolError } = await supabase
    .from('items')
    .select(`
      *,
      categories(id, name, slug)
    `)
    .eq('id', toolId)
    .single();
    
  if (toolError || !tool) {
    notFound();
  }
  
  // Verify ownership
  if (tool.owner_id !== user.id) {
    redirect('/tools');
  }
  
  // Get all categories for the form
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');
    
  if (categoriesError) throw categoriesError;
  
  // Get tool attributes if any
  const { data: toolAttributes, error: attributesError } = await supabase
    .from('item_attributes')
    .select(`
      *,
      attributes(id, name, type, options)
    `)
    .eq('item_id', toolId);
    
  if (attributesError) throw attributesError;
  
  return {
    tool,
    categories: categories || [],
    toolAttributes: toolAttributes || []
  };
}
```

### Page Conversion Examples

```typescript
// Before: src/app/(app)/loans/loans/page.tsx
'use client';
import { useAuth } from '@/common/supabase/hooks/useAuth';
import { LoanOperations } from '@/common/operations/loanOperations';

export default function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadUserLoans();
    }
  }, [user]);
  
  // ... client-side logic
}

// After: src/app/(app)/loans/loans/page.tsx
import { getUserLoans } from './getUserLoans';
import { LoansList } from './components/LoansList';
import { LoanStatusFilter } from './components/LoanStatusFilter';
import { LoanStats } from './components/LoanStats';

export default async function LoansPage() {
  const { borrowedLoans, lentLoans, stats } = await getUserLoans();
  
  return (
    <div>
      <h1>My Loans</h1>
      
      <LoanStats stats={stats} />
      
      <div className="loans-container">
        <section>
          <h2>Tools I'm Borrowing</h2>
          <LoanStatusFilter />
          <LoansList loans={borrowedLoans} type="borrowed" />
        </section>
        
        <section>
          <h2>Tools I've Lent</h2>
          <LoansList loans={lentLoans} type="lent" />
        </section>
      </div>
    </div>
  );
}
```

```typescript
// After: src/app/(app)/tools/tools/[id]/edit/page.tsx (if this page exists)
import { getEditToolData } from './getEditToolData';
import { EditToolForm } from './components/EditToolForm';

interface EditToolPageProps {
  params: { id: string };
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { tool, categories, toolAttributes } = await getEditToolData(params.id);
  
  return (
    <div>
      <h1>Edit Tool: {tool.name}</h1>
      
      <EditToolForm 
        tool={tool}
        categories={categories}
        toolAttributes={toolAttributes}
      />
    </div>
  );
}
```

### UI Component Examples

```typescript
// src/app/(app)/loans/loans/components/LoansList/index.tsx
interface LoansListProps {
  loans: LoanWithDetails[];
  type: 'borrowed' | 'lent';
}

export function LoansList({ loans, type }: LoansListProps) {
  if (!loans.length) {
    return (
      <div className="empty-state">
        <p>
          {type === 'borrowed' 
            ? "You haven't borrowed any tools yet." 
            : "You haven't lent any tools yet."
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="loans-list">
      {loans.map(loan => (
        <LoanCard key={loan.id} loan={loan} type={type} />
      ))}
    </div>
  );
}
```

```typescript
// src/app/(app)/loans/loans/components/LoanStatusFilter/index.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoanStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';
  
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`?${params.toString()}`);
  };
  
  return (
    <div className="status-filter">
      <button 
        className={currentStatus === 'all' ? 'active' : ''}
        onClick={() => handleStatusChange('all')}
      >
        All
      </button>
      <button 
        className={currentStatus === 'active' ? 'active' : ''}
        onClick={() => handleStatusChange('active')}
      >
        Active
      </button>
      <button 
        className={currentStatus === 'pending' ? 'active' : ''}
        onClick={() => handleStatusChange('pending')}
      >
        Pending
      </button>
      <button 
        className={currentStatus === 'completed' ? 'active' : ''}
        onClick={() => handleStatusChange('completed')}
      >
        Completed
      </button>
    </div>
  );
}
```

---

## ✅ Verification Checklist

### File Discovery Verification
- [ ] Confirmed which dynamic route pages actually exist
- [ ] Identified all pages that need conversion
- [ ] Analyzed current data fetching patterns

### File Creation Verification
- [ ] `getUserLoans.ts` server function created
- [ ] `getEditToolData.ts` server function created (if needed)
- [ ] All pages converted to server components
- [ ] All error.tsx and loading.tsx files created
- [ ] UI components extracted from pages

### Dynamic Route Verification
- [ ] Route parameters properly handled in server functions
- [ ] Not found cases handled with Next.js notFound()
- [ ] Ownership validation implemented where needed
- [ ] Proper redirects for unauthorized access
- [ ] URL-based state management for filters

### Functionality Verification
- [ ] Loan listing and filtering works correctly
- [ ] Tool editing preserves ownership validation
- [ ] All loan status changes work properly
- [ ] Dynamic routes handle edge cases correctly
- [ ] Interactive features preserved as client components
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ All dynamic route pages converted to server components
- ✅ Server data fetching functions created with proper validation
- ✅ Not found cases properly handled
- ✅ Ownership validation implemented where needed
- ✅ URL-based state management for filters
- ✅ All loan and tool functionality preserved
- ✅ Interactive features preserved as client components
- ✅ Proper error handling and loading states
- ✅ `task validate` passes without errors

---

*Phase 7e completes the conversion of dynamic routes while ensuring proper handling of route parameters, ownership validation, and not found cases.*
