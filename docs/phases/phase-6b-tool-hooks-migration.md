# Phase 6b: Tool Hooks Migration

## 🎯 Objective
Move 4 tool-related hook files from `src/common/hooks/` to be colocated with their respective tool functionality.

---

## 📋 Files to Migrate (4 files)

### 1. `useItems.ts` → `/app/(app)/tools/hooks/useItems.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/(app)/tools/hooks/`
- [ ] Copy `useItems.ts` to the new location
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for items data
- [ ] Add proper error handling for items operations
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `useItems.ts`
- [ ] Run `task validate` and fix all issues

### 2. `useItemsByOwner.ts` → `/app/(app)/tools/hooks/useItemsByOwner.ts`
**Size:** 1.0KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `useItemsByOwner.ts` to the same directory as useItems.ts
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for owner-specific items data
- [ ] Add proper error handling for owner-specific operations
- [ ] Update all imports in codebase that reference `useItemsByOwner.ts`
- [ ] Run `task validate` and fix all issues

### 3. `useItemSearch.ts` → `/app/(app)/tools/browse/hooks/useItemSearch.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/(app)/tools/browse/hooks/`
- [ ] Copy `useItemSearch.ts` to the new location
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for search functionality
- [ ] Add proper error handling for search operations
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `useItemSearch.ts`
- [ ] Run `task validate` and fix all issues

### 4. `useCategorySuggestions.ts` → `/app/(app)/tools/add/hooks/useCategorySuggestions.ts`
**Size:** 1.2KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/(app)/tools/add/hooks/`
- [ ] Copy `useCategorySuggestions.ts` to the new location
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for category suggestions
- [ ] Add proper error handling for category operations
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `useCategorySuggestions.ts`
- [ ] Run `task validate` and fix all issues

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/\(app\)/tools/hooks
mkdir -p src/app/\(app\)/tools/browse/hooks
mkdir -p src/app/\(app\)/tools/add/hooks
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Index Files
For each hooks directory, create an `index.ts` file that exports the hooks.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 4 tool hook files moved to appropriate tool directories
- [ ] All imports updated to use relative paths
- [ ] All corresponding `index.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] useItems hook works correctly
- [ ] useItemsByOwner hook works correctly
- [ ] useItemSearch hook works correctly
- [ ] useCategorySuggestions hook works correctly
- [ ] All tool functionality preserved

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All hook logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 4 tool hook files moved to tool-specific directories
- ✅ Hooks colocated with their usage
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
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

*Phase 6b focuses on moving all tool-related hooks to be colocated with their respective tool functionality, ensuring clear ownership and maintainability.*
