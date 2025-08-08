# Phase 4e: Social Feature Validation Migration

## 🎯 Objective
Move 2 social feature validator files from `src/common/validators/` to be colocated with their respective social API routes.

---

## 📋 Files to Migrate (2 files)

### 1. `socialFeatureValidator.ts` → `/api/(app)/social/validation/validateSocialFeature.ts`
**Size:** 1.8KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/validation/`
- [ ] Copy `socialFeatureValidator.ts` to `validateSocialFeature.ts`
- [ ] Refactor function names to be specific (e.g., `validateSocialFeature`, `socialFeatureSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for social feature data
- [ ] Add validation for social-specific fields (friend requests, messages, profiles)
- [ ] Add social feature validation logic
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `socialFeatureValidator.ts`


### 2. `itemAttributeValueValidator.ts` → `/api/(app)/social/validation/validateSocialAttribute.ts`
**Size:** 4.3KB | **Complexity:** High

**Subtasks:**
- [ ] Copy `itemAttributeValueValidator.ts` to `validateSocialAttribute.ts` (same directory as social)
- [ ] Refactor function names to be specific (e.g., `validateSocialAttribute`, `socialAttributeSchema`)
- [ ] Update imports to use `zod` and local dependencies
- [ ] Add proper TypeScript types for social attribute data
- [ ] Add validation for social attribute-specific fields (user preferences, social settings)
- [ ] Add complex validation logic for social attributes
- [ ] Add social attribute value validation
- [ ] Update all imports in codebase that reference `itemAttributeValueValidator.ts`


---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/\(app\)/social/validation
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
- [ ] All 2 social feature validation files moved to appropriate social directories
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `zod` and local dependencies
- [ ] All corresponding `index.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] Social feature validation works
- [ ] Social attribute validation works
- [ ] All social validation API endpoints respond correctly

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All validation logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 2 social feature validation files moved to social-specific directories
- ✅ Validation colocated with social API routes
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 4e focuses on moving all social feature validation logic to be colocated with their respective social API routes, ensuring clear ownership and maintainability.*
