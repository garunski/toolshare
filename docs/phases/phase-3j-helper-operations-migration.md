# Phase 3j: Helper Operations Migration

## 🎯 Objective
Move 8 helper operation files from `src/common/operations/helpers/` to be colocated with API routes in their respective domains. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (8 files)

### 1. `adminSubscriptionHelpers.ts` → `/api/admin/subscriptions/helpers/subscriptionHelpers.ts`
**Size:** 1.3KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/subscriptions/helpers/`
- [ ] Copy `adminSubscriptionHelpers.ts` to `subscriptionHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `subscriptionHelpers`, `manageAdminSubscriptions`, `validateSubscription`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add admin subscription helper functions
- [ ] Add subscription validation and management utilities
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `adminSubscriptionHelpers.ts`

### 2. `attributeMappingHelpers.ts` → `/api/admin/taxonomy/attributes/helpers/mappingHelpers.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/attributes/helpers/`
- [ ] Copy `attributeMappingHelpers.ts` to `mappingHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `mappingHelpers`, `mapAttributes`, `validateAttributeMapping`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add attribute mapping helper functions
- [ ] Add mapping validation and transformation utilities
- [ ] Add attribute mapping conflict resolution
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `attributeMappingHelpers.ts`

### 3. `connectionManagementHelpers.ts` → `/api/admin/system/connections/helpers/connectionHelpers.ts`
**Size:** 2.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/connections/helpers/`
- [ ] Copy `connectionManagementHelpers.ts` to `connectionHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `connectionHelpers`, `manageConnections`, `validateConnection`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add connection management helper functions
- [ ] Add connection validation and monitoring utilities
- [ ] Add connection pooling and optimization helpers
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `connectionManagementHelpers.ts`

### 4. `performanceMonitoringHelpers.ts` → `/api/admin/system/performance/helpers/performanceHelpers.ts`
**Size:** 2.0KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `performanceMonitoringHelpers.ts` to `performanceHelpers.ts` (same directory as system performance)
- [ ] Refactor function names to be specific (e.g., `performanceHelpers`, `monitorPerformance`, `analyzePerformanceMetrics`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add performance monitoring helper functions
- [ ] Add performance data formatting and analysis utilities
- [ ] Update all imports in codebase that reference `performanceMonitoringHelpers.ts`

### 5. `queryOptimizationHelpers.ts` → `/api/admin/system/optimization/helpers/optimizationHelpers.ts`
**Size:** 1.8KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `queryOptimizationHelpers.ts` to `optimizationHelpers.ts` (same directory as system optimization)
- [ ] Refactor function names to be specific (e.g., `optimizationHelpers`, `optimizeQueries`, `analyzeQueryPerformance`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add query optimization helper functions
- [ ] Add query analysis and optimization utilities
- [ ] Update all imports in codebase that reference `queryOptimizationHelpers.ts`

### 6. `realtimeConnectionHelpers.ts` → `/api/admin/system/realtime/helpers/connectionHelpers.ts`
**Size:** 725B | **Complexity:** Low

**Subtasks:**
- [ ] Copy `realtimeConnectionHelpers.ts` to `connectionHelpers.ts` (same directory as system realtime)
- [ ] Refactor function names to be specific (e.g., `connectionHelpers`, `manageRealtimeConnections`, `handleRealtimeEvents`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add real-time connection helper functions
- [ ] Add real-time event handling utilities
- [ ] Update all imports in codebase that reference `realtimeConnectionHelpers.ts`

### 7. `similarItemsHelper.ts` → `/api/(app)/tools/suggestions/helpers/similarItemsHelper.ts`
**Size:** 877B | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/suggestions/helpers/`
- [ ] Copy `similarItemsHelper.ts` to `similarItemsHelper.ts`
- [ ] Refactor function names to be specific (e.g., `similarItemsHelper`, `findSimilarItems`, `calculateSimilarity`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add similar items helper functions
- [ ] Add similarity calculation and ranking utilities
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `similarItemsHelper.ts`

### 8. `userSubscriptionHelpers.ts` → `/api/(app)/profiles/subscriptions/helpers/subscriptionHelpers.ts`
**Size:** 1.2KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/profiles/subscriptions/helpers/`
- [ ] Copy `userSubscriptionHelpers.ts` to `subscriptionHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `subscriptionHelpers`, `manageUserSubscriptions`, `validateUserSubscription`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add user subscription helper functions
- [ ] Add subscription validation and management utilities
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `userSubscriptionHelpers.ts`

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/subscriptions/helpers
mkdir -p src/app/api/admin/taxonomy/attributes/helpers
mkdir -p src/app/api/admin/system/connections/helpers
mkdir -p src/app/api/\(app\)/tools/suggestions/helpers
mkdir -p src/app/api/\(app\)/profiles/subscriptions/helpers
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Route Files
For each moved operation file, create a corresponding `route.ts` file that uses the business logic.

### Step 5: Test Each Migration
After each file is moved, test the functionality to ensure it works correctly.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 8 helper operation files moved to appropriate API routes
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `@/common/supabase/server`
- [ ] All corresponding `route.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] Run `task dev:code-quality` to ensure code quality standards
- [ ] All business logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 8 helper operation files moved to appropriate API route structures
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3j focuses on moving all helper business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
