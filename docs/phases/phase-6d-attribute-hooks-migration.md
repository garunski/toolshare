# Phase 6d: Attribute Hooks Migration

## 🎯 Objective
Move 2 attribute-related hook files from `src/common/hooks/` to be colocated with their respective attribute functionality.

---

## 📋 Files to Migrate (2 files)

### 1. `useAttributes.ts` → `/app/admin/attributes/hooks/useAttributes.ts`
**Size:** 2.6KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `useAttributes.ts` to the same directory as useAttributeHook.ts
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for attributes data
- [ ] Add proper error handling for attributes operations
- [ ] Update all imports in codebase that reference `useAttributes.ts`


### 2. `useAttributesByTypeHook.ts` → `/app/admin/attributes/hooks/useAttributesByTypeHook.ts`
**Size:** 1.1KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `useAttributesByTypeHook.ts` to the same directory as other attribute hooks
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for attributes by type data
- [ ] Add proper error handling for type-specific operations
- [ ] Update all imports in codebase that reference `useAttributesByTypeHook.ts`


---

## 🚀 Implementation Steps

### Step 1: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium).

### Step 2: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 3: Update Index File
Update the existing `index.ts` file in the attributes hooks directory to export the new hooks.

### Step 4: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 2 attribute hook files moved to appropriate attribute directories
- [ ] All imports updated to use relative paths
- [ ] Index file updated to export new hooks
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] useAttributes hook works correctly
- [ ] useAttributesByTypeHook hook works correctly
- [ ] All attribute functionality preserved

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All hook logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 2 attribute hook files moved to attribute-specific directories
- ✅ Hooks colocated with their usage
- ✅ All imports updated to use new locations
- ✅ Index file updated to export new hooks
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

*Phase 6d focuses on moving all attribute-related hooks to be colocated with their respective attribute functionality, ensuring clear ownership and maintainability.*
