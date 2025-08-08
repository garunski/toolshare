# Phase 7h: Data Hook Cleanup

## 🎯 Objective
Clean up, refactor, or remove data-fetching hooks that are no longer needed after converting pages to server components, while preserving hooks needed for client-side interactivity.

---

## 📋 Target Files (28+ hooks)

### Hooks to Remove (Data Fetching Only)
These hooks only fetch data and should be removed after server conversion:

### 1. Tool-Related Data Hooks (8 hooks)
- [ ] `src/app/(app)/tools/hooks/useItems.ts` - Replace with server function
- [ ] `src/app/(app)/tools/hooks/useItemsByOwner.ts` - Replace with server function
- [ ] `src/app/(app)/tools/browse/hooks/useItemSearch.ts` - Replace with server function
- [ ] `src/app/(app)/tools/tools/browse/hooks/useToolSearch.ts` - Replace with server function
- [ ] `src/app/(app)/tools/tools/add/components/hooks/useCategorySuggestions.ts` - Replace with server function
- [ ] Review and remove other tool data hooks

### 2. Admin Data Hooks (6 hooks)
- [ ] `src/app/admin/hooks/useRealtimeAdminData.ts` - Replace with server function
- [ ] `src/app/admin/users/hooks/useUserRoles.ts` - Replace with server function
- [ ] `src/app/admin/attributes/hooks/useAttributes.ts` - Replace with server function
- [ ] `src/app/admin/attributes/hooks/useAttributesByTypeHook.ts` - Replace with server function
- [ ] `src/app/admin/categories/hooks/useCategoryAttributes.ts` - Replace with server function
- [ ] Review and remove other admin data hooks

### 3. Social Data Hooks (3 hooks)
- [ ] `src/app/(app)/social/social/profile/[userId]/hooks/useProfileLogic.ts` - Replace with server function
- [ ] Review messaging hooks for data fetching vs. real-time functionality
- [ ] Review social feed hooks for data fetching vs. interactions

### Hooks to Refactor (Keep Interactive Parts)
These hooks contain both data fetching and client-side logic - refactor to keep only interactive parts:

### 4. Form Hooks (Keep Client-Side Logic) (6 hooks)
- [ ] `src/app/admin/attributes/hooks/useAttributeForm.ts` - Keep form state, remove data fetching
- [ ] `src/app/admin/categories/hooks/useCategoryForm.ts` - Keep form state, remove data fetching
- [ ] `src/app/(app)/social/social/profile/[userId]/hooks/useProfileActions.ts` - Keep actions, remove data fetching
- [ ] Review other form hooks for separation of concerns

### 5. Interactive Hooks (Keep All) (5 hooks)
- [ ] `src/app/(app)/hooks/useLazyLoading.ts` - Keep (UI interaction)
- [ ] `src/app/(app)/hooks/useMobileOptimization.ts` - Keep (UI optimization)
- [ ] `src/app/(app)/hooks/useTouchGestures.ts` - Keep (UI interaction)
- [ ] `src/app/(app)/hooks/useTouchGesturesCore.ts` - Keep (UI interaction)
- [ ] `src/app/(app)/hooks/useTouchGesturesHandlers.ts` - Keep (UI interaction)

### Hooks to Keep Unchanged (Truly Shared)
These hooks are truly shared and should remain:

### 6. Shared Hooks (Keep All) (7 hooks)
- [ ] `src/common/supabase/hooks/useAuth.ts` - Keep (shared auth)
- [ ] `src/common/supabase/hooks/useAuthActions.ts` - Keep (shared auth actions)
- [ ] `src/common/supabase/hooks/useCategories.ts` - Keep (shared categories)
- [ ] `src/app/admin/hooks/usePermissions.ts` - Keep (shared permissions)
- [ ] Review other shared hooks for continued necessity

---

## 🚀 Implementation Details

### Analysis Pattern for Each Hook

```typescript
// Step 1: Analyze hook purpose
// Example: src/app/(app)/tools/hooks/useItems.ts

// Current hook (DATA FETCHING ONLY - REMOVE)
export function useItems() {
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // This is pure data fetching - replace with server function
    loadItems();
  }, []);
  
  // Only data fetching, no client interactions
  return { items, loading, error };
}

// Action: REMOVE - Replaced by server function in getUserTools.ts
```

```typescript
// Example: Mixed hook that needs refactoring
// src/app/admin/attributes/hooks/useAttributeForm.ts

// Current hook (MIXED - REFACTOR)
export function useAttributeForm() {
  const [attributes, setAttributes] = useState([]); // DATA FETCHING - REMOVE
  const [formData, setFormData] = useState({}); // CLIENT STATE - KEEP
  const [isSubmitting, setIsSubmitting] = useState(false); // CLIENT STATE - KEEP
  
  useEffect(() => {
    loadAttributes(); // DATA FETCHING - REMOVE
  }, []);
  
  const handleSubmit = async (data) => { // CLIENT LOGIC - KEEP
    setIsSubmitting(true);
    // API call for form submission
    setIsSubmitting(false);
  };
  
  return {
    attributes, // REMOVE
    formData, // KEEP
    isSubmitting, // KEEP
    setFormData, // KEEP
    handleSubmit // KEEP
  };
}

// After refactoring (CLIENT INTERACTIONS ONLY)
export function useAttributeForm() {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      const response = await fetch('/api/admin/attributes/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errors = await response.json();
        setValidationErrors(errors);
        return;
      }
      
      // Success - let page handle navigation/refresh
      setFormData({});
    } catch (error) {
      setValidationErrors({ general: 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({});
    setValidationErrors({});
  };
  
  return {
    formData,
    setFormData,
    isSubmitting,
    validationErrors,
    handleSubmit,
    resetForm
  };
}
```

### Hook Removal Process

```typescript
// 1. Identify all usages of the hook
// Search for: import { useItems } from

// 2. Verify server function replacement exists
// Check: getUserTools.ts, getSearchResults.ts, etc.

// 3. Update components to receive data via props
// Before: Client component using hook
'use client';
import { useItems } from '../hooks/useItems';

export function ToolsList() {
  const { items, loading, error } = useItems();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {items.map(item => <ToolCard key={item.id} item={item} />)}
    </div>
  );
}

// After: UI component receiving props
interface ToolsListProps {
  items: Item[];
}

export function ToolsList({ items }: ToolsListProps) {
  if (!items.length) {
    return <div>No tools found</div>;
  }
  
  return (
    <div>
      {items.map(item => <ToolCard key={item.id} item={item} />)}
    </div>
  );
}

// 4. Remove the hook file
// rm src/app/(app)/tools/hooks/useItems.ts

// 5. Update index files if they exist
// Remove export from src/app/(app)/tools/hooks/index.ts
```

### Hook Refactoring Process

```typescript
// Example: Refactoring useAttributeForm
// Keep only client-side state and interactions

// Before: Mixed data fetching and client state
export function useAttributeForm() {
  // DATA FETCHING (remove)
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // CLIENT STATE (keep)
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // DATA FETCHING (remove)
    loadAttributes();
  }, []);
  
  // CLIENT INTERACTIONS (keep and improve)
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitAttribute(data);
      setFormData({});
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { attributes, loading, formData, isSubmitting, handleSubmit };
}

// After: Client interactions only
export function useAttributeForm() {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/admin/attributes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setFormData({});
        router.refresh(); // Refresh server data
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || { general: 'Submission failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    setFormData,
    isSubmitting,
    errors,
    handleSubmit,
    resetForm: () => {
      setFormData({});
      setErrors({});
    }
  };
}
```

### Component Updates After Hook Changes

```typescript
// Before: Component using data hook
'use client';
import { useAttributes } from '../hooks/useAttributes';

export function AttributeManagement() {
  const { attributes, loading, error } = useAttributes();
  
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {attributes.map(attr => <AttributeCard key={attr.id} attribute={attr} />)}
    </div>
  );
}

// After: Server component passes data, client component handles interactions
// Page (server component)
import { getAttributes } from './getAttributes';
import { AttributeManagement } from './components/AttributeManagement';

export default async function AttributesPage() {
  const attributes = await getAttributes();
  
  return (
    <div>
      <h1>Attribute Management</h1>
      <AttributeManagement attributes={attributes} />
    </div>
  );
}

// Component (UI only)
interface AttributeManagementProps {
  attributes: Attribute[];
}

export function AttributeManagement({ attributes }: AttributeManagementProps) {
  return (
    <div>
      {attributes.length === 0 ? (
        <div>No attributes found</div>
      ) : (
        attributes.map(attr => (
          <AttributeCard key={attr.id} attribute={attr} />
        ))
      )}
    </div>
  );
}
```

---

## ✅ Verification Checklist

### Hook Analysis Verification
- [ ] All hooks categorized (remove, refactor, keep)
- [ ] Data fetching hooks identified for removal
- [ ] Mixed hooks identified for refactoring
- [ ] Interactive hooks identified to keep
- [ ] Shared hooks verified as still needed

### Removal Verification
- [ ] All pure data fetching hooks removed
- [ ] All hook usages updated to props
- [ ] All import statements updated
- [ ] Hook index files updated
- [ ] No broken references remain

### Refactoring Verification
- [ ] Mixed hooks refactored to client-only logic
- [ ] Data fetching removed from hooks
- [ ] Client interactions preserved and improved
- [ ] Form state management working correctly
- [ ] API calls updated to use fetch directly

### Component Updates Verification
- [ ] Components receive data via props instead of hooks
- [ ] Server components pass data to client components
- [ ] Client components handle interactions only
- [ ] No data fetching in client components
- [ ] Proper TypeScript interfaces defined

### Functionality Verification
- [ ] All interactive features still working
- [ ] Form submissions working correctly
- [ ] Client-side state management preserved
- [ ] No data fetching in client components
- [ ] Server-side data properly passed down
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ All pure data fetching hooks removed
- ✅ Mixed hooks refactored to client-only logic
- ✅ Interactive and shared hooks preserved
- ✅ Components updated to receive data via props
- ✅ No data fetching in client components
- ✅ All client interactions preserved and working
- ✅ Proper separation of server and client concerns
- ✅ Clean, maintainable hook structure
- ✅ `task validate` passes without errors

---

*Phase 7h completes the data fetching extraction by cleaning up hooks, ensuring clear separation between server-side data fetching and client-side interactions.*
