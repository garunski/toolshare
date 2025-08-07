# Phase 6a: Hooks Analysis and Migration Planning

## 📊 Current Hooks Inventory

### Total Files: 19 hook files

---

## 🔍 Detailed File Analysis

### Tool-Related Hooks (4 files)
**Target: `/app/(app)/tools/` routes**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useItems.ts` | 3.2KB | `/app/(app)/tools/hooks/useItems.ts` | Medium |
| `useItemsByOwner.ts` | 1.0KB | `/app/(app)/tools/hooks/useItemsByOwner.ts` | Low |
| `useItemSearch.ts` | 1.1KB | `/app/(app)/tools/browse/hooks/useItemSearch.ts` | Low |
| `useCategorySuggestions.ts` | 1.2KB | `/app/(app)/tools/add/hooks/useCategorySuggestions.ts` | Low |

### Admin-Related Hooks (4 files)
**Target: `/app/admin/` routes**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useUserRoles.ts` | 2.2KB | `/app/admin/users/hooks/useUserRoles.ts` | Medium |
| `usePermissions.ts` | 1.8KB | `/app/admin/hooks/usePermissions.ts` | Medium |
| `useRealtimeAdminData.ts` | 3.8KB | `/app/admin/hooks/useRealtimeAdminData.ts` | High |
| `useAttributeHook.ts` | 1.0KB | `/app/admin/attributes/hooks/useAttributeHook.ts` | Low |

### Attribute-Related Hooks (2 files)
**Target: `/app/admin/attributes/` routes**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useAttributes.ts` | 2.6KB | `/app/admin/attributes/hooks/useAttributes.ts` | Medium |
| `useAttributesByTypeHook.ts` | 1.1KB | `/app/admin/attributes/hooks/useAttributesByTypeHook.ts` | Low |

### Social-Related Hooks (1 file)
**Target: `/app/(app)/social/` routes**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useProfileActions.ts` | 3.1KB | `/app/(app)/social/profile/hooks/useProfileActions.ts` | Medium |

### Mobile/Touch-Related Hooks (3 files)
**Target: `/app/(app)/hooks/`**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useMobileOptimization.ts` | 2.5KB | `/app/(app)/hooks/useMobileOptimization.ts` | Medium |
| `useTouchGestures.ts` | 2.2KB | `/app/(app)/hooks/useTouchGestures.ts` | Medium |
| `useTouchGesturesCore.ts` | 2.5KB | `/app/(app)/hooks/useTouchGesturesCore.ts` | Medium |

### Touch Gesture Handler Hooks (1 file)
**Target: `/app/(app)/hooks/`**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useTouchGesturesHandlers.ts` | 2.0KB | `/app/(app)/hooks/useTouchGesturesHandlers.ts` | Medium |

### Utility Hooks (1 file)
**Target: `/app/(app)/hooks/`**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useLazyLoading.ts` | 1.8KB | `/app/(app)/hooks/useLazyLoading.ts` | Medium |

### Truly Shared Hooks (3 files) - TO BE MOVED TO SUPABASE
**Target: `/common/supabase/hooks/`**

| Current File | Size | Target Location | Migration Complexity |
|--------------|------|-----------------|---------------------|
| `useAuth.ts` | 1.5KB | `/common/supabase/hooks/useAuth.ts` | Low |
| `useAuthWithRoles.ts` | 664B | `/common/supabase/hooks/useAuthWithRoles.ts` | Low |
| `useCategories.ts` | 3.8KB | `/common/supabase/hooks/useCategories.ts` | Medium |

---

## 📋 Migration Sub-Phases Plan

### Phase 6a: Analysis and Preparation ✅
- [x] Complete file inventory
- [x] Map files to target locations
- [x] Assess migration complexity
- [ ] Create backup of hooks directory
- [ ] Set up migration tracking

### Phase 6b: Tool Hooks Migration (4 files)
**Priority: High** - Core tool functionality
- [ ] Move useItems.ts
- [ ] Move useItemsByOwner.ts
- [ ] Move useItemSearch.ts
- [ ] Move useCategorySuggestions.ts

### Phase 6c: Admin Hooks Migration (4 files)
**Priority: High** - Admin functionality
- [ ] Move useUserRoles.ts
- [ ] Move usePermissions.ts
- [ ] Move useRealtimeAdminData.ts
- [ ] Move useAttributeHook.ts

### Phase 6d: Attribute Hooks Migration (2 files)
**Priority: Medium** - Attribute functionality
- [ ] Move useAttributes.ts
- [ ] Move useAttributesByTypeHook.ts

### Phase 6e: Social Hooks Migration (1 file)
**Priority: Medium** - Social functionality
- [ ] Move useProfileActions.ts

### Phase 6f: Mobile/Touch Hooks Migration (4 files)
**Priority: Medium** - Mobile functionality
- [ ] Move useMobileOptimization.ts
- [ ] Move useTouchGestures.ts
- [ ] Move useTouchGesturesCore.ts
- [ ] Move useTouchGesturesHandlers.ts

### Phase 6g: Utility Hooks Migration (1 file)
**Priority: Low** - Utility functionality
- [ ] Move useLazyLoading.ts

### Phase 6h: Shared Hooks Migration (3 files)
**Priority: High** - Shared functionality
- [ ] Move useAuth.ts to supabase
- [ ] Move useAuthWithRoles.ts to supabase
- [ ] Move useCategories.ts to supabase

### Phase 6i: Cleanup and Validation
**Priority: Critical** - Final cleanup
- [ ] Remove empty hooks directory
- [ ] Update all remaining imports
- [ ] Run comprehensive validation
- [ ] Verify no functionality is broken

---

## 🚨 Migration Complexity Assessment

### High Complexity (1 file)
- Files with complex logic and multiple dependencies
- Files requiring significant refactoring

### Medium Complexity (12 files)
- Files with moderate logic and some dependencies
- Files requiring moderate refactoring

### Low Complexity (6 files)
- Simple hook files with minimal dependencies
- Files requiring minimal refactoring

---

## 📊 Estimated Effort

- **Total Files**: 19
- **High Complexity**: 1 file (5%)
- **Medium Complexity**: 12 files (63%)
- **Low Complexity**: 6 files (32%)

**Estimated Total Effort**: 9 sub-phases, each taking 20-40 minutes
**Total Estimated Time**: 3-6 hours

---

## 🎯 Migration Strategy

### Colocation Strategy
1. **Move hooks to their usage location** - place hooks where they are actually used
2. **Create proper directory structure** - organize hooks by domain and functionality
3. **Use relative imports** - update all imports to use relative paths
4. **Create index files** - provide clean exports for better organization

### Shared Hooks Strategy
1. **Identify truly shared hooks** - hooks used across multiple domains
2. **Move to supabase directory** - place shared hooks in `src/common/supabase/hooks/`
3. **Maintain clear documentation** - document shared hook usage and dependencies

---

*This analysis provides the foundation for creating detailed implementation plans for each sub-phase.*
