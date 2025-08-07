# Phase 3e: Category and Attribute Operations Migration

## 🎯 Objective
Move 12 category and attribute operation files from `src/common/operations/` to be colocated with API routes in `/api/admin/taxonomy/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (12 files)

### 1. `categoryOperations.ts` → `/api/admin/taxonomy/categories/performCategory.ts`
**Size:** 3.2KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/categories/`
- [x] Copy `categoryOperations.ts` to `performCategory.ts`
- [x] Refactor function names to be specific (e.g., `performCategory`, `createCategory`, `updateCategory`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add category CRUD operations logic
- [x] Add category validation and hierarchy management
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categoryOperations.ts`

### 2. `categoryCRUDOperations.ts` → `/api/admin/taxonomy/categories/crud/performCategoryCRUD.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/categories/crud/`
- [x] Copy `categoryCRUDOperations.ts` to `performCategoryCRUD.ts`
- [x] Refactor function names to be specific (e.g., `performCategoryCRUD`, `createCategory`, `readCategory`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add CRUD operation logic for categories
- [x] Add category data validation
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categoryCRUDOperations.ts`

### 3. `categoryAttributeOperations.ts` → `/api/admin/taxonomy/attributes/performAttribute.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/attributes/`
- [x] Copy `categoryAttributeOperations.ts` to `performAttribute.ts`
- [x] Refactor function names to be specific (e.g., `performAttribute`, `manageCategoryAttributes`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add attribute management logic for categories
- [x] Add attribute validation and type checking
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categoryAttributeOperations.ts`

### 4. `categoryTreeBuilder.ts` → `/api/admin/taxonomy/tree/buildCategoryTree.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/tree/`
- [x] Copy `categoryTreeBuilder.ts` to `buildCategoryTree.ts`
- [x] Refactor function names to be specific (e.g., `buildCategoryTree`, `getCategoryHierarchy`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add category tree building logic
- [x] Add hierarchical category structure management
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categoryTreeBuilder.ts`

### 5. `categoryBasedSuggestions.ts` → `/api/admin/taxonomy/suggestions/getCategorySuggestions.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/suggestions/`
- [x] Copy `categoryBasedSuggestions.ts` to `getCategorySuggestions.ts`
- [x] Refactor function names to be specific (e.g., `getCategorySuggestions`, `suggestCategories`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add category suggestion logic
- [x] Add suggestion ranking and filtering
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categoryBasedSuggestions.ts`

### 6. `categoryScoringHelper.ts` → `/api/admin/taxonomy/scoring/scoreCategories.ts`
**Size:** 2.3KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/scoring/`
- [x] Copy `categoryScoringHelper.ts` to `scoreCategories.ts`
- [x] Refactor function names to be specific (e.g., `scoreCategories`, `calculateCategoryScore`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add category scoring logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categoryScoringHelper.ts`

### 7. `categorySelectOperations.ts` → `/api/admin/taxonomy/select/performCategorySelect.ts`
**Size:** 498B | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/select/`
- [x] Copy `categorySelectOperations.ts` to `performCategorySelect.ts`
- [x] Refactor function names to be specific (e.g., `performCategorySelect`, `selectCategories`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add category selection logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categorySelectOperations.ts`

### 8. `categorySuggestionEngine.ts` → `/api/admin/taxonomy/suggestions/engine/suggestCategories.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/suggestions/engine/`
- [x] Copy `categorySuggestionEngine.ts` to `suggestCategories.ts`
- [x] Refactor function names to be specific (e.g., `suggestCategories`, `runSuggestionEngine`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add advanced category suggestion engine logic
- [x] Add machine learning-based suggestions
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `categorySuggestionEngine.ts`

### 9. `attributeOperations.ts` → `/api/admin/taxonomy/attributes/performAttributeOperations.ts`
**Size:** 4.3KB | **Complexity:** High

**Subtasks:**
- [x] Copy `attributeOperations.ts` to `performAttributeOperations.ts` (same directory as attributes)
- [x] Refactor function names to be specific (e.g., `performAttributeOperations`, `manageAttributes`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add comprehensive attribute management logic
- [x] Add attribute CRUD operations
- [x] Update all imports in codebase that reference `attributeOperations.ts`

### 10. `attributeMappingSystem.ts` → `/api/admin/taxonomy/attributes/mapping/manageAttributeMapping.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/attributes/mapping/`
- [x] Copy `attributeMappingSystem.ts` to `manageAttributeMapping.ts`
- [x] Refactor function names to be specific (e.g., `manageAttributeMapping`, `mapAttributes`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add attribute mapping system logic
- [x] Add mapping validation and conflict resolution
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `attributeMappingSystem.ts`

### 11. `attributeValidationHelper.ts` → `/api/admin/taxonomy/attributes/validation/validateAttributes.ts`
**Size:** 1.7KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/attributes/validation/`
- [x] Copy `attributeValidationHelper.ts` to `validateAttributes.ts`
- [x] Refactor function names to be specific (e.g., `validateAttributes`, `checkAttributeValidity`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add attribute validation logic
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `attributeValidationHelper.ts`

### 12. `externalTaxonomyOperations.ts` → `/api/admin/taxonomy/external/performExternalTaxonomy.ts`
**Size:** 3.5KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/taxonomy/external/`
- [x] Copy `externalTaxonomyOperations.ts` to `performExternalTaxonomy.ts`
- [x] Refactor function names to be specific (e.g., `performExternalTaxonomy`, `importExternalTaxonomy`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add external taxonomy import/export logic
- [x] Add external API integration
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `externalTaxonomyOperations.ts`

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/taxonomy/categories
mkdir -p src/app/api/admin/taxonomy/categories/crud
mkdir -p src/app/api/admin/taxonomy/attributes
mkdir -p src/app/api/admin/taxonomy/attributes/mapping
mkdir -p src/app/api/admin/taxonomy/attributes/validation
mkdir -p src/app/api/admin/taxonomy/tree
mkdir -p src/app/api/admin/taxonomy/suggestions
mkdir -p src/app/api/admin/taxonomy/suggestions/engine
mkdir -p src/app/api/admin/taxonomy/scoring
mkdir -p src/app/api/admin/taxonomy/select
mkdir -p src/app/api/admin/taxonomy/external
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
- [x] All 12 category and attribute operation files moved to appropriate API routes
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

- ✅ All 12 category and attribute operation files moved to `/api/admin/taxonomy/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3e focuses on moving all category and attribute business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
