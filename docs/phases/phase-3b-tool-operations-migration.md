# Phase 3b: Tool Operations Migration

## 🎯 Objective
Move 15 tool-related operation files from `src/common/operations/` to be colocated with API routes in `/api/(app)/tools/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (15 files)

### 1. `toolCRUD.ts` → `/api/(app)/tools/create/performTool.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/create/`
- [x] Copy `toolCRUD.ts` to `performTool.ts`
- [x] Refactor function names to be specific (e.g., `performTool`, `performToolUpdate`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add proper error handling for tool creation
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `toolCRUD.ts`
- [x] Run `task validate` and fix all issues

### 2. `toolQueries.ts` → `/api/(app)/tools/list/getTools.ts`
**Size:** 3.4KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/list/`
- [x] Copy `toolQueries.ts` to `getTools.ts`
- [x] Refactor function names to be specific (e.g., `getTools`, `getToolById`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add proper filtering and pagination support
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `toolQueries.ts`
- [x] Run `task validate` and fix all issues

### 3. `toolDataProcessor.ts` → `/api/(app)/tools/process/processToolData.ts`
**Size:** 1.4KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/process/`
- [x] Copy `toolDataProcessor.ts` to `processToolData.ts`
- [x] Refactor function names to be specific (e.g., `processToolData`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `toolDataProcessor.ts`
- [x] Run `task validate` and fix all issues

### 4. `toolImageUploader.ts` → `/api/(app)/tools/upload/uploadToolImage.ts`
**Size:** 3.6KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/upload/`
- [x] Copy `toolImageUploader.ts` to `uploadToolImage.ts`
- [x] Refactor function names to be specific (e.g., `uploadToolImage`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add proper file validation and size limits
- [x] Add image optimization logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `toolImageUploader.ts`
- [x] Run `task validate` and fix all issues

### 5. `toolSearchOperations.ts` → `/api/(app)/tools/search/performToolSearch.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/search/`
- [x] Copy `toolSearchOperations.ts` to `performToolSearch.ts`
- [x] Refactor function names to be specific (e.g., `performToolSearch`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add search filters and sorting options
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `toolSearchOperations.ts`
- [x] Run `task validate` and fix all issues

### 6. `toolSearchProcessor.ts` → `/api/(app)/tools/search/processToolSearch.ts`
**Size:** 2.3KB | **Complexity:** Low

**Subtasks:**
- [x] Copy `toolSearchProcessor.ts` to `processToolSearch.ts` (same directory as above)
- [x] Refactor function names to be specific (e.g., `processToolSearch`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Update all imports in codebase that reference `toolSearchProcessor.ts`
- [x] Run `task validate` and fix all issues

### 7. `itemOperations.ts` → `/api/(app)/tools/[id]/update/performItemUpdate.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/[id]/update/`
- [x] Copy `itemOperations.ts` to `performItemUpdate.ts`
- [x] Refactor function names to be specific (e.g., `performItemUpdate`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add proper validation for item updates
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `itemOperations.ts`
- [x] Run `task validate` and fix all issues

### 8. `itemOwnerOperations.ts` → `/api/(app)/tools/[id]/owner/performOwnerUpdate.ts`
**Size:** 2.6KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/[id]/owner/`
- [x] Copy `itemOwnerOperations.ts` to `performOwnerUpdate.ts`
- [x] Refactor function names to be specific (e.g., `performOwnerUpdate`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add ownership validation logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `itemOwnerOperations.ts`
- [x] Run `task validate` and fix all issues

### 9. `itemSearchOperations.ts` → `/api/(app)/tools/search/performItemSearch.ts`
**Size:** 1.9KB | **Complexity:** Low

**Subtasks:**
- [x] Copy `itemSearchOperations.ts` to `performItemSearch.ts` (same directory as search)
- [x] Refactor function names to be specific (e.g., `performItemSearch`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Update all imports in codebase that reference `itemSearchOperations.ts`
- [x] Run `task validate` and fix all issues

### 10. `itemStatisticsOperations.ts` → `/api/(app)/tools/[id]/stats/getItemStats.ts`
**Size:** 2.4KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/[id]/stats/`
- [x] Copy `itemStatisticsOperations.ts` to `getItemStats.ts`
- [x] Refactor function names to be specific (e.g., `getItemStats`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add statistics calculation logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `itemStatisticsOperations.ts`
- [x] Run `task validate` and fix all issues

### 11. `itemCategoryQueries.ts` → `/api/(app)/tools/categories/getToolCategories.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/categories/`
- [x] Copy `itemCategoryQueries.ts` to `getToolCategories.ts`
- [x] Refactor function names to be specific (e.g., `getToolCategories`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `itemCategoryQueries.ts`
- [x] Run `task validate` and fix all issues

### 12. `itemRecentQueries.ts` → `/api/(app)/tools/recent/getRecentTools.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/recent/`
- [x] Copy `itemRecentQueries.ts` to `getRecentTools.ts`
- [x] Refactor function names to be specific (e.g., `getRecentTools`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `itemRecentQueries.ts`
- [x] Run `task validate` and fix all issues

### 13. `similarItemSuggestions.ts` → `/api/(app)/tools/suggestions/getSimilarItems.ts`
**Size:** 1.8KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/suggestions/`
- [x] Copy `similarItemSuggestions.ts` to `getSimilarItems.ts`
- [x] Refactor function names to be specific (e.g., `getSimilarItems`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add similarity calculation logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `similarItemSuggestions.ts`
- [x] Run `task validate` and fix all issues

### 14. `smartDefaults.ts` → `/api/(app)/tools/defaults/getSmartDefaults.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/defaults/`
- [x] Copy `smartDefaults.ts` to `getSmartDefaults.ts`
- [x] Refactor function names to be specific (e.g., `getSmartDefaults`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `smartDefaults.ts`
- [x] Run `task validate` and fix all issues

### 15. `imageOptimizationService.ts` → `/api/(app)/tools/images/optimizeImage.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/(app)/tools/images/`
- [x] Copy `imageOptimizationService.ts` to `optimizeImage.ts`
- [x] Refactor function names to be specific (e.g., `optimizeImage`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add image optimization and compression logic
- [x] Add multiple format support
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `imageOptimizationService.ts`
- [x] Run `task validate` and fix all issues

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
- [x] All 15 tool operation files moved to appropriate API routes
- [x] All function names refactored to be specific and descriptive
- [x] All imports updated to use `@/common/supabase/server`
- [x] All corresponding `route.ts` files created
- [x] All imports in codebase updated to reference new locations

### ✅ Code Quality Verification
- [x] Run `task validate` to ensure no TypeScript errors
- [x] Run `task dev:code-quality` to ensure code quality standards
- [x] All business logic preserved after moving
- [x] No functionality broken

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
