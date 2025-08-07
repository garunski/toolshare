# Phase 4d: Taxonomy Validation Migration

## 🎯 Objective
Move 3 taxonomy validator files from `src/common/validators/` to be colocated with their respective taxonomy API routes.

---

## 📋 Files to Migrate (3 files)

### 1. `taxonomyValidator.ts` → `/api/admin/taxonomy/validation/validateTaxonomy.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/validation/`
- [ ] Copy `taxonomyValidator.ts` to `validateTaxonomy.ts`
- [ ] Refactor function names to be specific (e.g., `validateTaxonomy`, `taxonomySchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for taxonomy data
- [ ] Add validation for taxonomy-specific fields (name, structure, rules)
- [ ] Add taxonomy structure validation logic
- [ ] Add taxonomy import/export validation
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `taxonomyValidator.ts`
- [ ] Run `task validate` and fix all issues

### 2. `attributeSchemas.ts` → `/api/admin/taxonomy/attributes/validation/attributeSchemas.ts`
**Size:** 1.3KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/attributes/validation/`
- [ ] Copy `attributeSchemas.ts` to `attributeSchemas.ts`
- [ ] Refactor function names to be specific (e.g., `attributeSchemas`, `getAttributeSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for attribute schemas
- [ ] Add schema definition and validation logic
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `attributeSchemas.ts`
- [ ] Run `task validate` and fix all issues

### 3. `attributeValidationHelpers.ts` → `/api/admin/taxonomy/attributes/validation/attributeValidationHelpers.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `attributeValidationHelpers.ts` to `attributeValidationHelpers.ts` (same directory as attributes)
- [ ] Refactor function names to be specific (e.g., `attributeValidationHelpers`, `validateAttributeHelper`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for validation helpers
- [ ] Add helper functions for attribute validation
- [ ] Add validation utility functions
- [ ] Update all imports in codebase that reference `attributeValidationHelpers.ts`
- [ ] Run `task validate` and fix all issues

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/taxonomy/validation
mkdir -p src/app/api/admin/taxonomy/attributes/validation
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Index Files
For each validation directory, create an `index.ts` file that exports the validation functions and types.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 3 taxonomy validation files moved to appropriate taxonomy directories
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `zod` and local dependencies
- [ ] All corresponding `index.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] Taxonomy validation works
- [ ] Attribute schemas work
- [ ] Attribute validation helpers work
- [ ] All taxonomy validation API endpoints respond correctly

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All validation logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 3 taxonomy validation files moved to taxonomy-specific directories
- ✅ Validation colocated with taxonomy API routes
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 4d focuses on moving all taxonomy validation logic to be colocated with their respective taxonomy API routes, ensuring clear ownership and maintainability.*
