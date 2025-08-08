# Phase 6b: Tool Hooks Migration

## 🎯 Objective
Move 4 tool-related hook files from `src/common/hooks/` to be colocated with their respective tool functionality.

---

## 📋 Files to Migrate (4 files)

### 1. `useItems.ts` → `/app/(app)/tools/hooks/useItems.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/(app)/tools/hooks/`
- [x] Copy `useItems.ts` to the new location
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for items data
- [x] Add proper error handling for items operations
- [x] Create corresponding `index.ts` file for exports
- [x] Update all imports in codebase that reference `useItems.ts`


### 2. `useItemsByOwner.ts` → `/app/(app)/tools/hooks/useItemsByOwner.ts`
**Size:** 1.0KB | **Complexity:** Low

**Subtasks:**
- [x] Copy `useItemsByOwner.ts` to the same directory as useItems.ts
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for owner-specific items data
- [x] Add proper error handling for owner-specific operations
- [x] Update all imports in codebase that reference `useItemsByOwner.ts`


### 3. `useItemSearch.ts` → `/app/(app)/tools/browse/hooks/useItemSearch.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/(app)/tools/browse/hooks/`
- [x] Copy `useItemSearch.ts` to the new location
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for search functionality
- [x] Add proper error handling for search operations
- [x] Create corresponding `index.ts` file for exports
- [x] Update all imports in codebase that reference `useItemSearch.ts`


### 4. `useCategorySuggestions.ts` → `/app/(app)/tools/add/hooks/useCategorySuggestions.ts`
**Size:** 1.2KB | **Complexity:** Low

**Subtasks:**
- [x] Already colocated in `src/app/(app)/tools/tools/add/components/hooks/useCategorySuggestions.ts`
- [x] No migration needed - already in correct location
- [x] Already using proper TypeScript types
- [x] Already has proper error handling
- [x] Already properly organized
- [x] No import updates needed


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
- [x] All 4 tool hook files moved to appropriate tool directories
- [x] All imports updated to use relative paths
- [x] All corresponding `index.ts` files created
- [x] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [x] useItems hook works correctly
- [x] useItemsByOwner hook works correctly
- [x] useItemSearch hook works correctly
- [x] useCategorySuggestions hook works correctly
- [x] All tool functionality preserved

### ✅ Code Quality Verification
- [x] Run `task validate` to ensure no TypeScript errors
- [x] All hook logic preserved after moving
- [x] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 4 tool hook files moved to tool-specific directories
- ✅ Hooks colocated with their usage
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

## ✅ Phase 6b Complete!

All tool hooks have been successfully migrated and colocated with their respective functionality. The migration included:

1. **useItems.ts** → `src/app/(app)/tools/hooks/useItems.ts`
2. **useItemsByOwner.ts** → `src/app/(app)/tools/hooks/useItemsByOwner.ts`
3. **useItemSearch.ts** → `src/app/(app)/tools/browse/hooks/useItemSearch.ts`
4. **useCategorySuggestions.ts** → Already colocated (no migration needed)

All validation checks passed successfully!

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
