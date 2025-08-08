# Phase 6h: Shared Hooks Migration

## 🎯 Objective
Move 3 truly shared hook files from `src/common/hooks/` to `src/common/supabase/hooks/` to maintain proper organization of shared functionality.

---

## 📋 Files to Migrate (3 files)

### 1. `useAuth.ts` → `/common/supabase/hooks/useAuth.ts`
**Size:** 1.5KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/common/supabase/hooks/`
- [ ] Copy `useAuth.ts` to the new location
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for auth data
- [ ] Add proper error handling for auth operations
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `useAuth.ts`


### 2. `useAuthWithRoles.ts` → `/common/supabase/hooks/useAuthWithRoles.ts`
**Size:** 664B | **Complexity:** Low

**Subtasks:**
- [ ] Copy `useAuthWithRoles.ts` to the same directory as useAuth.ts
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for auth with roles data
- [ ] Add proper error handling for auth with roles operations
- [ ] Update all imports in codebase that reference `useAuthWithRoles.ts`


### 3. `useCategories.ts` → `/common/supabase/hooks/useCategories.ts`
**Size:** 3.8KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `useCategories.ts` to the same directory as other shared hooks
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for categories data
- [ ] Add proper error handling for categories operations
- [ ] Update all imports in codebase that reference `useCategories.ts`


---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/common/supabase/hooks
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Index File
Create an `index.ts` file that exports all the shared hooks.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 3 shared hook files moved to supabase hooks directory
- [ ] All imports updated to use relative paths
- [ ] Corresponding `index.ts` file created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] useAuth hook works correctly
- [ ] useAuthWithRoles hook works correctly
- [ ] useCategories hook works correctly
- [ ] All shared functionality preserved

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All hook logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 3 shared hook files moved to supabase hooks directory
- ✅ Hooks properly organized in shared location
- ✅ All imports updated to use new locations
- ✅ Corresponding index file created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

## 🚨 Common Issues and Solutions

### Issue: Import Path Errors
**Problem:** Import paths break after moving hooks
**Solution:**
- Update all import statements to use relative paths
- Use IDE refactoring tools to update imports
- Check for any absolute imports that need updating

### Issue: TypeScript Errors
**Problem:** TypeScript compilation fails after moving hooks
**Solution:**
- Check for any type references that need updating
- Ensure all dependencies are properly imported
- Update any type definitions that reference the old location

### Issue: Runtime Errors
**Problem:** Application crashes due to missing hook imports
**Solution:**
- Check for any dynamic imports or lazy loading
- Update any code that references the moved hooks
- Test the application thoroughly after each move

---

*Phase 6h focuses on moving truly shared hooks to the supabase directory to maintain proper organization of shared functionality across the application.*
