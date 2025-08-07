# Phase 4c: Admin API Validation Migration

## 🎯 Objective
Move 4 admin API validator files from `src/common/validators/` to be colocated with their respective API routes.

---

## 📋 Files to Migrate (4 files)

### 1. `userCreationValidator.ts` → `/api/admin/users/create/validation/validateUserCreation.ts`
**Size:** 2.5KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/create/validation/`
- [ ] Copy `userCreationValidator.ts` to `validateUserCreation.ts`
- [ ] Refactor function names to be specific (e.g., `validateUserCreation`, `userCreationSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for user creation data
- [ ] Add validation for user-specific fields (email, password, name, role)
- [ ] Add admin permission validation logic
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `userCreationValidator.ts`
- [ ] Run `task validate` and fix all issues

### 2. `roleValidator.ts` → `/api/admin/roles/assign/validation/validateRoleAssignment.ts`
**Size:** 2.7KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/assign/validation/`
- [ ] Copy `roleValidator.ts` to `validateRoleAssignment.ts`
- [ ] Refactor function names to be specific (e.g., `validateRoleAssignment`, `roleAssignmentSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for role assignment data
- [ ] Add validation for role-specific fields (user_id, role, permissions)
- [ ] Add role assignment validation logic
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `roleValidator.ts`
- [ ] Run `task validate` and fix all issues

### 3. `categoryValidator.ts` → `/api/admin/taxonomy/categories/validation/validateCategory.ts`
**Size:** 4.0KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/categories/validation/`
- [ ] Copy `categoryValidator.ts` to `validateCategory.ts`
- [ ] Refactor function names to be specific (e.g., `validateCategory`, `categorySchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for category data
- [ ] Add validation for category-specific fields (name, description, parent_id, attributes)
- [ ] Add category hierarchy validation logic
- [ ] Add category attribute validation
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `categoryValidator.ts`
- [ ] Run `task validate` and fix all issues

### 4. `attributeValidator.ts` → `/api/admin/taxonomy/attributes/validation/validateAttribute.ts`
**Size:** 3.6KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/taxonomy/attributes/validation/`
- [ ] Copy `attributeValidator.ts` to `validateAttribute.ts`
- [ ] Refactor function names to be specific (e.g., `validateAttribute`, `attributeSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for attribute data
- [ ] Add validation for attribute-specific fields (name, type, constraints, validation_rules)
- [ ] Add attribute type validation logic
- [ ] Add attribute constraint validation
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `attributeValidator.ts`
- [ ] Run `task validate` and fix all issues

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/users/create/validation
mkdir -p src/app/api/admin/roles/assign/validation
mkdir -p src/app/api/admin/taxonomy/categories/validation
mkdir -p src/app/api/admin/taxonomy/attributes/validation
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Index Files
For each validation directory, create an `index.ts` file that exports the validation functions and types.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 4 admin API validation files moved to appropriate API directories
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `zod` and local dependencies
- [ ] All corresponding `index.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] User creation validation works
- [ ] Role assignment validation works
- [ ] Category validation works
- [ ] Attribute validation works
- [ ] All admin API validation endpoints respond correctly

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All validation logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 4 admin API validation files moved to API-specific directories
- ✅ Validation colocated with API routes
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 4c focuses on moving all admin API validation logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
