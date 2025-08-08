# Phase 4b: Form Validation Migration

## 🎯 Objective
Move 6 form-related validator files from `src/common/validators/` to be colocated with their respective forms.

---

## 📋 Files to Migrate (6 files)

### 1. `authenticationFormValidator.ts` → `/app/(auth)/login/validation/validateAuthentication.ts`
**Size:** 1.3KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/(auth)/login/validation/`
- [ ] Copy `authenticationFormValidator.ts` to `validateAuthentication.ts`
- [ ] Refactor function names to be specific (e.g., `validateAuthentication`, `loginSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for form data
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `authenticationFormValidator.ts`


### 2. `toolCreationValidator.ts` → `/app/(app)/tools/add/validation/validateToolCreation.ts`
**Size:** 1.7KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/(app)/tools/add/validation/`
- [ ] Copy `toolCreationValidator.ts` to `validateToolCreation.ts`
- [ ] Refactor function names to be specific (e.g., `validateToolCreation`, `toolCreationSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for tool creation data
- [ ] Add validation for tool-specific fields (name, description, category, etc.)
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `toolCreationValidator.ts`


### 3. `borrowingRequestValidator.ts` → `/app/(app)/tools/[id]/validation/validateBorrowingRequest.ts`
**Size:** 1.2KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/(app)/tools/[id]/validation/`
- [ ] Copy `borrowingRequestValidator.ts` to `validateBorrowingRequest.ts`
- [ ] Refactor function names to be specific (e.g., `validateBorrowingRequest`, `borrowingRequestSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for borrowing request data
- [ ] Add validation for borrowing-specific fields (start date, end date, notes)
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `borrowingRequestValidator.ts`


### 4. `itemValidator.ts` → `/app/(app)/tools/add/validation/validateItem.ts`
**Size:** 2.9KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `itemValidator.ts` to `validateItem.ts` (same directory as tool creation)
- [ ] Refactor function names to be specific (e.g., `validateItem`, `itemSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for item data
- [ ] Add validation for item-specific fields (condition, location, tags)
- [ ] Update all imports in codebase that reference `itemValidator.ts`


### 5. `itemAttributeValidator.ts` → `/app/(app)/tools/add/validation/validateItemAttribute.ts`
**Size:** 2.4KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `itemAttributeValidator.ts` to `validateItemAttribute.ts` (same directory as tool creation)
- [ ] Refactor function names to be specific (e.g., `validateItemAttribute`, `itemAttributeSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for item attribute data
- [ ] Add validation for attribute-specific fields (type, value, required)
- [ ] Update all imports in codebase that reference `itemAttributeValidator.ts`


### 6. `itemAttributeValueValidator.ts` → `/app/(app)/tools/add/validation/validateItemAttributeValue.ts`
**Size:** 4.3KB | **Complexity:** High

**Subtasks:**
- [ ] Copy `itemAttributeValueValidator.ts` to `validateItemAttributeValue.ts` (same directory as tool creation)
- [ ] Refactor function names to be specific (e.g., `validateItemAttributeValue`, `itemAttributeValueSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for item attribute value data
- [ ] Add validation for attribute value-specific fields (data type, constraints, validation rules)
- [ ] Add complex validation logic for different attribute types
- [ ] Update all imports in codebase that reference `itemAttributeValueValidator.ts`


---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/\(auth\)/login/validation
mkdir -p src/app/\(app\)/tools/add/validation
mkdir -p src/app/\(app\)/tools/\[id\]/validation
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
- [ ] All 6 form validation files moved to appropriate form directories
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `zod` and local dependencies
- [ ] All corresponding `index.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] Authentication form validation works
- [ ] Tool creation validation works
- [ ] Borrowing request validation works
- [ ] Item validation works
- [ ] Item attribute validation works
- [ ] Item attribute value validation works
- [ ] All form validation API endpoints respond correctly

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All validation logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 6 form validation files moved to form-specific directories
- ✅ Validation colocated with forms
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 4b focuses on moving all form validation logic to be colocated with their respective forms, ensuring clear ownership and maintainability.*
