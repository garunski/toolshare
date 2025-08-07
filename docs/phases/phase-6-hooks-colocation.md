# Phase 6: Move Hooks to Their Components

## 🎯 Objective
Move all hooks from `src/common/hooks/` to where they are actually used, ensuring proper colocation and eliminating the anti-pattern of scattered hook definitions.

---

## 🚨 Current State Analysis

**Problem:** Hooks are scattered in `src/common/hooks/` instead of being colocated with their usage
```
src/common/hooks/
├── useAddToolForm.ts - Should be with AddToolForm component
├── useCategorySuggestions.ts - Should be with category selection
├── useToolSearch.ts - Should be with tool search functionality
├── useUsersList.ts - Should be with admin users list
├── useAuth.ts - Truly shared, should stay in common/supabase
├── useCategories.ts - Truly shared, should stay in common/supabase
└── (15+ other hooks) - All should be colocated with their usage
```

**Impact:**
- Hooks are hard to find and maintain
- No clear ownership of hook logic
- Difficult to understand dependencies
- Violates colocation principles

---

## 🚀 Step-by-Step Implementation

### Step 1: Identify Hook Usage and Ownership

**Before moving, analyze each hook to determine:**
- Which component/page uses this hook
- Is it truly shared across multiple sections?
- What is the primary responsibility of the hook?

```bash
# Example analysis
useAddToolForm.ts → Used only by AddToolForm → Move to src/app/(app)/tools/add/hooks/
useCategorySuggestions.ts → Used only by category selection → Move to src/app/(app)/tools/add/hooks/
useToolSearch.ts → Used only by tool search → Move to src/app/(app)/tools/browse/hooks/
useAuth.ts → Used across entire app → Keep in src/common/supabase/hooks/
```

### Step 2: Move Page-Specific Hooks

**Current:** Hooks in `src/common/hooks/`
**Target:** Hooks colocated with their usage

```bash
# Move tool-related hooks
mv src/common/hooks/useAddToolForm.ts src/app/\(app\)/tools/add/hooks/useAddToolForm.ts
mv src/common/hooks/useCategorySuggestions.ts src/app/\(app\)/tools/add/hooks/useCategorySuggestions.ts
mv src/common/hooks/useToolSearch.ts src/app/\(app\)/tools/browse/hooks/useToolSearch.ts
mv src/common/hooks/useItems.ts src/app/\(app\)/tools/hooks/useItems.ts
mv src/common/hooks/useItemsByOwner.ts src/app/\(app\)/tools/hooks/useItemsByOwner.ts
mv src/common/hooks/useItemSearch.ts src/app/\(app\)/tools/browse/hooks/useItemSearch.ts

# Move admin-related hooks
mv src/common/hooks/useUsersList.ts src/app/admin/users/hooks/useUsersList.ts
mv src/common/hooks/useUserRoles.ts src/app/admin/users/hooks/useUserRoles.ts
mv src/common/hooks/usePermissions.ts src/app/admin/hooks/usePermissions.ts
mv src/common/hooks/useRealtimeAdminData.ts src/app/admin/hooks/useRealtimeAdminData.ts

# Move loan-related hooks
mv src/common/hooks/useLoans.ts src/app/\(app\)/loans/hooks/useLoans.ts
mv src/common/hooks/useLoanStatus.ts src/app/\(app\)/loans/hooks/useLoanStatus.ts

# Move social-related hooks
mv src/common/hooks/useProfileActions.ts src/app/\(app\)/social/profile/hooks/useProfileActions.ts
mv src/common/hooks/useFriendRequests.ts src/app/\(app\)/social/hooks/useFriendRequests.ts
mv src/common/hooks/useMessages.ts src/app/\(app\)/social/messages/hooks/useMessages.ts

# Move auth-related hooks (keep shared ones)
mv src/common/hooks/useAuth.ts src/common/supabase/hooks/useAuth.ts
mv src/common/hooks/useAuthWithRoles.ts src/common/supabase/hooks/useAuthWithRoles.ts
```

### Step 3: Move Form-Specific Hooks

**Current:** Form hooks in `src/common/hooks/`
**Target:** Form hooks colocated with their forms

```bash
# Move form hooks to their respective form directories
mv src/common/hooks/useLoginForm.ts src/app/\(auth\)/login/hooks/useLoginForm.ts
mv src/common/hooks/useRegisterForm.ts src/app/\(auth\)/register/hooks/useRegisterForm.ts
mv src/common/hooks/useProfileSetupForm.ts src/app/\(auth\)/profile-setup/hooks/useProfileSetupForm.ts

# Move admin form hooks
mv src/common/hooks/useCreateUserForm.ts src/app/admin/users/hooks/useCreateUserForm.ts
mv src/common/hooks/useCategoryForm.ts src/app/admin/categories/hooks/useCategoryForm.ts
mv src/common/hooks/useAttributeForm.ts src/app/admin/attributes/hooks/useAttributeForm.ts
```

### Step 4: Move Utility Hooks

**Current:** Utility hooks in `src/common/hooks/`
**Target:** Utility hooks colocated with their usage

```bash
# Move mobile/touch-related hooks
mv src/common/hooks/useMobileOptimization.ts src/app/\(app\)/hooks/useMobileOptimization.ts
mv src/common/hooks/useTouchGestures.ts src/app/\(app\)/hooks/useTouchGestures.ts
mv src/common/hooks/useTouchGesturesCore.ts src/app/\(app\)/hooks/useTouchGesturesCore.ts
mv src/common/hooks/useTouchGesturesHandlers.ts src/app/\(app\)/hooks/useTouchGesturesHandlers.ts

# Move lazy loading hooks
mv src/common/hooks/useLazyLoading.ts src/app/\(app\)/hooks/useLazyLoading.ts

# Move attribute-related hooks
mv src/common/hooks/useAttributeHook.ts src/app/admin/attributes/hooks/useAttributeHook.ts
mv src/common/hooks/useAttributes.ts src/app/admin/attributes/hooks/useAttributes.ts
mv src/common/hooks/useAttributesByTypeHook.ts src/app/admin/attributes/hooks/useAttributesByTypeHook.ts
```

### Step 5: Keep Truly Shared Hooks

**Current:** Some hooks are truly shared across the application
**Target:** Keep these in `src/common/supabase/hooks/`

```bash
# Keep truly shared hooks
# These hooks are used across multiple sections and should remain shared
src/common/supabase/hooks/
├── useAuth.ts
├── useAuthWithRoles.ts
├── useCategories.ts
└── useCategories.ts
```

### Step 6: Update Import Statements

**After moving hooks, update all import statements:**

```typescript
// Before: src/app/(app)/tools/add/components/AddToolForm.tsx
import { useAddToolForm } from '@/common/hooks/useAddToolForm';

// After: src/app/(app)/tools/add/components/AddToolForm.tsx
import { useAddToolForm } from '../hooks/useAddToolForm';
```

```typescript
// Before: src/app/admin/users/components/UsersList.tsx
import { useUsersList } from '@/common/hooks/useUsersList';

// After: src/app/admin/users/components/UsersList.tsx
import { useUsersList } from '../hooks/useUsersList';
```

```typescript
// Before: src/app/(app)/tools/browse/components/SearchResults.tsx
import { useToolSearch } from '@/common/hooks/useToolSearch';

// After: src/app/(app)/tools/browse/components/SearchResults.tsx
import { useToolSearch } from '../hooks/useToolSearch';
```

### Step 7: Create Hook Index Files

**Create index files for better organization:**

```typescript
// src/app/(app)/tools/add/hooks/index.ts
export { useAddToolForm } from './useAddToolForm';
export { useCategorySuggestions } from './useCategorySuggestions';
```

```typescript
// src/app/admin/users/hooks/index.ts
export { useUsersList } from './useUsersList';
export { useUserRoles } from './useUserRoles';
export { useCreateUserForm } from './useCreateUserForm';
```

```typescript
// src/common/supabase/hooks/index.ts
export { useAuth } from './useAuth';
export { useAuthWithRoles } from './useAuthWithRoles';
export { useCategories } from './useCategories';
```

### Step 8: Clean Up Empty Directories

**Remove empty directories after moving all hooks:**

```bash
# Remove empty hooks directory if all hooks have been moved
rmdir src/common/hooks

# Remove any other empty directories created during the process
find src -type d -empty -delete
```

---

## 📋 Verification Checklist

### ✅ Hook Colocation Verification

- [ ] All page-specific hooks moved to their respective page directories
- [ ] All form hooks moved to their respective form directories
- [ ] All component-specific hooks moved to their component directories
- [ ] Truly shared hooks remain in `src/common/supabase/hooks/`
- [ ] All import statements updated to use relative paths
- [ ] Hook index files created for better organization
- [ ] Empty directories cleaned up
- [ ] No hooks remaining in `src/common/hooks/`

### ✅ Code Quality Verification

- [ ] All hooks follow the `use` prefix naming convention
- [ ] Hooks are properly typed with TypeScript
- [ ] Hooks have clear, single responsibilities
- [ ] No circular dependencies between hooks
- [ ] Hooks are properly documented with JSDoc comments

### ✅ Testing Verification

- [ ] All components using hooks still function correctly
- [ ] No runtime errors from missing hook imports
- [ ] All hook functionality preserved after moving
- [ ] Performance not degraded by hook colocation

---

## 🎯 Success Criteria

- ✅ All hooks colocated with their usage
- ✅ No hooks remaining in `src/common/hooks/`
- ✅ Clear ownership of hook logic
- ✅ Easy to find and maintain hooks
- ✅ Proper import paths using relative imports
- ✅ Truly shared hooks remain in `src/common/supabase/hooks/`
- ✅ No circular dependencies
- ✅ All functionality preserved

---

## 🚨 Common Issues and Solutions

### Issue: Circular Dependencies
**Problem:** Moving hooks creates circular import dependencies
**Solution:** 
- Analyze hook dependencies before moving
- Extract shared logic to separate utility files
- Use dependency injection where necessary

### Issue: Missing Imports
**Problem:** Import statements not updated after moving hooks
**Solution:**
- Use IDE refactoring tools to update imports
- Run TypeScript compiler to catch missing imports
- Use search and replace for common import patterns

### Issue: Hook Reusability
**Problem:** Hooks that seem specific are actually used in multiple places
**Solution:**
- Keep truly shared hooks in `src/common/supabase/hooks/`
- Create shared hook utilities for common patterns
- Document hook usage and dependencies clearly

---

## 📚 Additional Resources

- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

*Phase 6 focuses on proper hook colocation, ensuring that all hooks are placed where they are actually used, making the codebase more maintainable and easier to understand.*
