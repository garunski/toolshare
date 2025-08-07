# Phase 3e: Category and Attribute Operations Migration

## 🎯 Objective
Move 12 category and attribute operation files from `src/common/operations/` to be colocated with API routes in `/api/admin/taxonomy/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (12 files)

### 1. `categoryOperations.ts` → `/api/admin/taxonomy/categories/performCategory.ts`
**Size:** 3.2KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/categories/`
- [ ] Copy `categoryOperations.ts` to `performCategory.ts`
- [ ] Refactor function names to be specific (e.g., `performCategory`, `createCategory`, `updateCategory`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add category CRUD operations logic
- [ ] Add category validation and hierarchy management
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categoryOperations.ts`

### 2. `categoryCRUDOperations.ts` → `/api/admin/taxonomy/categories/crud/performCategoryCRUD.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/categories/crud/`
- [ ] Copy `categoryCRUDOperations.ts` to `performCategoryCRUD.ts`
- [ ] Refactor function names to be specific (e.g., `performCategoryCRUD`, `createCategory`, `readCategory`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add CRUD operation logic for categories
- [ ] Add category data validation
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categoryCRUDOperations.ts`

### 3. `categoryAttributeOperations.ts` → `/api/admin/taxonomy/attributes/performAttribute.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/attributes/`
- [ ] Copy `categoryAttributeOperations.ts` to `performAttribute.ts`
- [ ] Refactor function names to be specific (e.g., `performAttribute`, `manageCategoryAttributes`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add attribute management logic for categories
- [ ] Add attribute validation and type checking
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categoryAttributeOperations.ts`

### 4. `categoryTreeBuilder.ts` → `/api/admin/taxonomy/tree/buildCategoryTree.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/tree/`
- [ ] Copy `categoryTreeBuilder.ts` to `buildCategoryTree.ts`
- [ ] Refactor function names to be specific (e.g., `buildCategoryTree`, `getCategoryHierarchy`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add category tree building logic
- [ ] Add hierarchical category structure management
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categoryTreeBuilder.ts`

### 5. `categoryBasedSuggestions.ts` → `/api/admin/taxonomy/suggestions/getCategorySuggestions.ts`
**Size:** 2.3KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/suggestions/`
- [ ] Copy `categoryBasedSuggestions.ts` to `getCategorySuggestions.ts`
- [ ] Refactor function names to be specific (e.g., `getCategorySuggestions`, `suggestCategories`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add category suggestion logic
- [ ] Add suggestion ranking and filtering
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categoryBasedSuggestions.ts`

### 6. `categoryScoringHelper.ts` → `/api/admin/taxonomy/scoring/scoreCategories.ts`
**Size:** 2.3KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/scoring/`
- [ ] Copy `categoryScoringHelper.ts` to `scoreCategories.ts`
- [ ] Refactor function names to be specific (e.g., `scoreCategories`, `calculateCategoryScore`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add category scoring logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categoryScoringHelper.ts`

### 7. `categorySelectOperations.ts` → `/api/admin/taxonomy/select/performCategorySelect.ts`
**Size:** 498B | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/select/`
- [ ] Copy `categorySelectOperations.ts` to `performCategorySelect.ts`
- [ ] Refactor function names to be specific (e.g., `performCategorySelect`, `selectCategories`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add category selection logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categorySelectOperations.ts`

### 8. `categorySuggestionEngine.ts` → `/api/admin/taxonomy/suggestions/engine/suggestCategories.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/suggestions/engine/`
- [ ] Copy `categorySuggestionEngine.ts` to `suggestCategories.ts`
- [ ] Refactor function names to be specific (e.g., `suggestCategories`, `runSuggestionEngine`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add advanced category suggestion engine logic
- [ ] Add machine learning-based suggestions
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `categorySuggestionEngine.ts`

### 9. `attributeOperations.ts` → `/api/admin/taxonomy/attributes/performAttributeOperations.ts`
**Size:** 4.3KB | **Complexity:** High

**Subtasks:**
- [ ] Copy `attributeOperations.ts` to `performAttributeOperations.ts` (same directory as attributes)
- [ ] Refactor function names to be specific (e.g., `performAttributeOperations`, `manageAttributes`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add comprehensive attribute management logic
- [ ] Add attribute CRUD operations
- [ ] Update all imports in codebase that reference `attributeOperations.ts`

### 10. `attributeMappingSystem.ts` → `/api/admin/taxonomy/attributes/mapping/manageAttributeMapping.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/attributes/mapping/`
- [ ] Copy `attributeMappingSystem.ts` to `manageAttributeMapping.ts`
- [ ] Refactor function names to be specific (e.g., `manageAttributeMapping`, `mapAttributes`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add attribute mapping system logic
- [ ] Add mapping validation and conflict resolution
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `attributeMappingSystem.ts`

### 11. `attributeValidationHelper.ts` → `/api/admin/taxonomy/attributes/validation/validateAttributes.ts`
**Size:** 1.7KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/attributes/validation/`
- [ ] Copy `attributeValidationHelper.ts` to `validateAttributes.ts`
- [ ] Refactor function names to be specific (e.g., `validateAttributes`, `checkAttributeValidity`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add attribute validation logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `attributeValidationHelper.ts`

### 12. `externalTaxonomyOperations.ts` → `/api/admin/taxonomy/external/performExternalTaxonomy.ts`
**Size:** 3.5KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/external/`
- [ ] Copy `externalTaxonomyOperations.ts` to `performExternalTaxonomy.ts`
- [ ] Refactor function names to be specific (e.g., `performExternalTaxonomy`, `importExternalTaxonomy`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add external taxonomy import/export logic
- [ ] Add external API integration
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `externalTaxonomyOperations.ts`

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
- [ ] All 12 category and attribute operation files moved to appropriate API routes
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

- ✅ All 12 category and attribute operation files moved to `/api/admin/taxonomy/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3e focuses on moving all category and attribute business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
