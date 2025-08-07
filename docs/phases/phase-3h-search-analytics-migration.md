# Phase 3h: Search and Analytics Operations Migration

## 🎯 Objective
Move 8 search and analytics operation files from `src/common/operations/` to be colocated with API routes in `/api/(app)/search/` and `/api/admin/analytics/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (8 files)

### 1. `advancedSearchCore.ts` → `/api/(app)/search/core/performAdvancedSearch.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/search/core/`
- [ ] Copy `advancedSearchCore.ts` to `performAdvancedSearch.ts`
- [ ] Refactor function names to be specific (e.g., `performAdvancedSearch`, `executeSearchQuery`, `buildSearchQuery`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add advanced search core logic
- [ ] Add search query building and optimization
- [ ] Add search result ranking and scoring
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `advancedSearchCore.ts`

### 2. `advancedSearchEngine.ts` → `/api/(app)/search/engine/runSearchEngine.ts`
**Size:** 2.9KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/search/engine/`
- [ ] Copy `advancedSearchEngine.ts` to `runSearchEngine.ts`
- [ ] Refactor function names to be specific (e.g., `runSearchEngine`, `executeSearchEngine`, `processSearchRequest`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add search engine execution logic
- [ ] Add search algorithm implementation
- [ ] Add search performance optimization
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `advancedSearchEngine.ts`

### 3. `advancedSearchAnalytics.ts` → `/api/admin/analytics/search/analyzeSearch.ts`
**Size:** 1.8KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/analytics/search/`
- [ ] Copy `advancedSearchAnalytics.ts` to `analyzeSearch.ts`
- [ ] Refactor function names to be specific (e.g., `analyzeSearch`, `generateSearchAnalytics`, `getSearchMetrics`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add search analytics logic
- [ ] Add search performance metrics collection
- [ ] Add search trend analysis
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `advancedSearchAnalytics.ts`

### 4. `advancedSearchHelpers.ts` → `/api/(app)/search/helpers/searchHelpers.ts`
**Size:** 2.6KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/search/helpers/`
- [ ] Copy `advancedSearchHelpers.ts` to `searchHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `searchHelpers`, `formatSearchQuery`, `validateSearchParams`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add search helper functions
- [ ] Add search query formatting and validation
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `advancedSearchHelpers.ts`

### 5. `analyticsReportingService.ts` → `/api/admin/analytics/reports/generateReports.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/analytics/reports/`
- [ ] Copy `analyticsReportingService.ts` to `generateReports.ts`
- [ ] Refactor function names to be specific (e.g., `generateReports`, `createAnalyticsReport`, `exportReportData`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add analytics report generation logic
- [ ] Add report formatting and export functionality
- [ ] Add scheduled report generation
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `analyticsReportingService.ts`

### 6. `analyticsDataCollector.ts` → `/api/admin/analytics/collect/collectAnalytics.ts`
**Size:** 3.1KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/analytics/collect/`
- [ ] Copy `analyticsDataCollector.ts` to `collectAnalytics.ts`
- [ ] Refactor function names to be specific (e.g., `collectAnalytics`, `gatherAnalyticsData`, `processAnalyticsData`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add analytics data collection logic
- [ ] Add data processing and aggregation
- [ ] Add analytics data storage and retrieval
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `analyticsDataCollector.ts`

### 7. `socialStatsOperations.ts` → `/api/admin/analytics/social/getSocialStats.ts`
**Size:** 1.6KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/analytics/social/`
- [ ] Copy `socialStatsOperations.ts` to `getSocialStats.ts`
- [ ] Refactor function names to be specific (e.g., `getSocialStats`, `calculateSocialMetrics`, `analyzeSocialActivity`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add social statistics calculation logic
- [ ] Add social activity analysis
- [ ] Add social engagement metrics
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `socialStatsOperations.ts`

### 8. `socialStatsProcessor.ts` → `/api/admin/analytics/social/processSocialStats.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `socialStatsProcessor.ts` to `processSocialStats.ts` (same directory as social)
- [ ] Refactor function names to be specific (e.g., `processSocialStats`, `aggregateSocialData`, `formatSocialStats`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add social statistics processing logic
- [ ] Add data aggregation and formatting
- [ ] Update all imports in codebase that reference `socialStatsProcessor.ts`

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/\(app\)/search/core
mkdir -p src/app/api/\(app\)/search/engine
mkdir -p src/app/api/\(app\)/search/helpers
mkdir -p src/app/api/admin/analytics/search
mkdir -p src/app/api/admin/analytics/reports
mkdir -p src/app/api/admin/analytics/collect
mkdir -p src/app/api/admin/analytics/social
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Route Files
For each moved operation file, create a corresponding `route.ts` file that uses the business logic.

### Step 5: Test Each Migration
After each file is moved, test the functionality to ensure it works correctly.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 8 search and analytics operation files moved to appropriate API routes
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

- ✅ All 8 search and analytics operation files moved to appropriate API route structures
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3h focuses on moving all search and analytics business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
