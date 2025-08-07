# Phase 3b: Tool Operations Migration

## 🎯 Objective
Move 15 tool-related operation files from `src/common/operations/` to be colocated with API routes in `/api/(app)/tools/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (15 files)

### 1. `toolCRUD.ts` → `/api/(app)/tools/create/performTool.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/create/`
- [ ] Copy `toolCRUD.ts` to `performTool.ts`
- [ ] Refactor function names to be specific (e.g., `performTool`, `performToolUpdate`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add proper error handling for tool creation
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `toolCRUD.ts`
- [ ] Run `task validate` and fix all issues

### 2. `toolQueries.ts` → `/api/(app)/tools/list/getTools.ts`
**Size:** 3.4KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/list/`
- [ ] Copy `toolQueries.ts` to `getTools.ts`
- [ ] Refactor function names to be specific (e.g., `getTools`, `getToolById`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add proper filtering and pagination support
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `toolQueries.ts`
- [ ] Run `task validate` and fix all issues

### 3. `toolDataProcessor.ts` → `/api/(app)/tools/process/processToolData.ts`
**Size:** 1.4KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/process/`
- [ ] Copy `toolDataProcessor.ts` to `processToolData.ts`
- [ ] Refactor function names to be specific (e.g., `processToolData`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `toolDataProcessor.ts`
- [ ] Run `task validate` and fix all issues

### 4. `toolImageUploader.ts` → `/api/(app)/tools/upload/uploadToolImage.ts`
**Size:** 3.6KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/upload/`
- [ ] Copy `toolImageUploader.ts` to `uploadToolImage.ts`
- [ ] Refactor function names to be specific (e.g., `uploadToolImage`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add proper file validation and size limits
- [ ] Add image optimization logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `toolImageUploader.ts`
- [ ] Run `task validate` and fix all issues

### 5. `toolSearchOperations.ts` → `/api/(app)/tools/search/performToolSearch.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/search/`
- [ ] Copy `toolSearchOperations.ts` to `performToolSearch.ts`
- [ ] Refactor function names to be specific (e.g., `performToolSearch`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add search filters and sorting options
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `toolSearchOperations.ts`
- [ ] Run `task validate` and fix all issues

### 6. `toolSearchProcessor.ts` → `/api/(app)/tools/search/processToolSearch.ts`
**Size:** 2.3KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `toolSearchProcessor.ts` to `processToolSearch.ts` (same directory as above)
- [ ] Refactor function names to be specific (e.g., `processToolSearch`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Update all imports in codebase that reference `toolSearchProcessor.ts`
- [ ] Run `task validate` and fix all issues

### 7. `itemOperations.ts` → `/api/(app)/tools/[id]/update/performItemUpdate.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/[id]/update/`
- [ ] Copy `itemOperations.ts` to `performItemUpdate.ts`
- [ ] Refactor function names to be specific (e.g., `performItemUpdate`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add proper validation for item updates
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `itemOperations.ts`
- [ ] Run `task validate` and fix all issues

### 8. `itemOwnerOperations.ts` → `/api/(app)/tools/[id]/owner/performOwnerUpdate.ts`
**Size:** 2.6KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/[id]/owner/`
- [ ] Copy `itemOwnerOperations.ts` to `performOwnerUpdate.ts`
- [ ] Refactor function names to be specific (e.g., `performOwnerUpdate`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add ownership validation logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `itemOwnerOperations.ts`
- [ ] Run `task validate` and fix all issues

### 9. `itemSearchOperations.ts` → `/api/(app)/tools/search/performItemSearch.ts`
**Size:** 1.9KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `itemSearchOperations.ts` to `performItemSearch.ts` (same directory as search)
- [ ] Refactor function names to be specific (e.g., `performItemSearch`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Update all imports in codebase that reference `itemSearchOperations.ts`
- [ ] Run `task validate` and fix all issues

### 10. `itemStatisticsOperations.ts` → `/api/(app)/tools/[id]/stats/getItemStats.ts`
**Size:** 2.4KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/[id]/stats/`
- [ ] Copy `itemStatisticsOperations.ts` to `getItemStats.ts`
- [ ] Refactor function names to be specific (e.g., `getItemStats`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add statistics calculation logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `itemStatisticsOperations.ts`
- [ ] Run `task validate` and fix all issues

### 11. `itemCategoryQueries.ts` → `/api/(app)/tools/categories/getToolCategories.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/categories/`
- [ ] Copy `itemCategoryQueries.ts` to `getToolCategories.ts`
- [ ] Refactor function names to be specific (e.g., `getToolCategories`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `itemCategoryQueries.ts`
- [ ] Run `task validate` and fix all issues

### 12. `itemRecentQueries.ts` → `/api/(app)/tools/recent/getRecentTools.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/recent/`
- [ ] Copy `itemRecentQueries.ts` to `getRecentTools.ts`
- [ ] Refactor function names to be specific (e.g., `getRecentTools`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `itemRecentQueries.ts`
- [ ] Run `task validate` and fix all issues

### 13. `similarItemSuggestions.ts` → `/api/(app)/tools/suggestions/getSimilarItems.ts`
**Size:** 1.8KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/suggestions/`
- [ ] Copy `similarItemSuggestions.ts` to `getSimilarItems.ts`
- [ ] Refactor function names to be specific (e.g., `getSimilarItems`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add similarity calculation logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `similarItemSuggestions.ts`
- [ ] Run `task validate` and fix all issues

### 14. `smartDefaults.ts` → `/api/(app)/tools/defaults/getSmartDefaults.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/defaults/`
- [ ] Copy `smartDefaults.ts` to `getSmartDefaults.ts`
- [ ] Refactor function names to be specific (e.g., `getSmartDefaults`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `smartDefaults.ts`
- [ ] Run `task validate` and fix all issues

### 15. `imageOptimizationService.ts` → `/api/(app)/tools/images/optimizeImage.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/tools/images/`
- [ ] Copy `imageOptimizationService.ts` to `optimizeImage.ts`
- [ ] Refactor function names to be specific (e.g., `optimizeImage`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add image optimization and compression logic
- [ ] Add multiple format support
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `imageOptimizationService.ts`
- [ ] Run `task validate` and fix all issues

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/\(app\)/tools/create
mkdir -p src/app/api/\(app\)/tools/list
mkdir -p src/app/api/\(app\)/tools/process
mkdir -p src/app/api/\(app\)/tools/upload
mkdir -p src/app/api/\(app\)/tools/search
mkdir -p src/app/api/\(app\)/tools/\[id\]/update
mkdir -p src/app/api/\(app\)/tools/\[id\]/owner
mkdir -p src/app/api/\(app\)/tools/\[id\]/stats
mkdir -p src/app/api/\(app\)/tools/categories
mkdir -p src/app/api/\(app\)/tools/recent
mkdir -p src/app/api/\(app\)/tools/suggestions
mkdir -p src/app/api/\(app\)/tools/defaults
mkdir -p src/app/api/\(app\)/tools/images
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Route Files
For each moved operation file, create a corresponding `route.ts` file that uses the business logic.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues to ensure it works correctly.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 15 tool operation files moved to appropriate API routes
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

- ✅ All 15 tool operation files moved to `/api/(app)/tools/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3b focuses on moving all tool-related business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
