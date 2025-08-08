# Phase 6f: Mobile/Touch Hooks Migration

## 🎯 Objective
Move 4 mobile/touch-related hook files from `src/common/hooks/` to be colocated with their respective mobile functionality.

---

## 📋 Files to Migrate (4 files)

### 1. `useMobileOptimization.ts` → `/app/(app)/hooks/useMobileOptimization.ts`
**Size:** 2.5KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/(app)/hooks/`
- [ ] Copy `useMobileOptimization.ts` to the new location
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for mobile optimization data
- [ ] Add proper error handling for mobile operations
- [ ] Create corresponding `index.ts` file for exports
- [ ] Update all imports in codebase that reference `useMobileOptimization.ts`


### 2. `useTouchGestures.ts` → `/app/(app)/hooks/useTouchGestures.ts`
**Size:** 2.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `useTouchGestures.ts` to the same directory as useMobileOptimization.ts
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for touch gestures data
- [ ] Add proper error handling for touch operations
- [ ] Update all imports in codebase that reference `useTouchGestures.ts`


### 3. `useTouchGesturesCore.ts` → `/app/(app)/hooks/useTouchGesturesCore.ts`
**Size:** 2.5KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `useTouchGesturesCore.ts` to the same directory as other touch hooks
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for touch gestures core data
- [ ] Add proper error handling for core touch operations
- [ ] Update all imports in codebase that reference `useTouchGesturesCore.ts`


### 4. `useTouchGesturesHandlers.ts` → `/app/(app)/hooks/useTouchGesturesHandlers.ts`
**Size:** 2.0KB | **Complexity:** Medium

**Subtasks:**
- [ ] Copy `useTouchGesturesHandlers.ts` to the same directory as other touch hooks
- [ ] Update imports to use relative paths and local dependencies
- [ ] Add proper TypeScript types for touch gesture handlers data
- [ ] Add proper error handling for handler operations
- [ ] Update all imports in codebase that reference `useTouchGesturesHandlers.ts`


---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/\(app\)/hooks
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order.

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Index File
Create an `index.ts` file that exports all the mobile/touch hooks.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 4 mobile/touch hook files moved to appropriate hooks directory
- [ ] All imports updated to use relative paths
- [ ] Corresponding `index.ts` file created
- [ ] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [ ] useMobileOptimization hook works correctly
- [ ] useTouchGestures hook works correctly
- [ ] useTouchGesturesCore hook works correctly
- [ ] useTouchGesturesHandlers hook works correctly
- [ ] All mobile/touch functionality preserved

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] All hook logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 4 mobile/touch hook files moved to hooks-specific directory
- ✅ Hooks colocated with their usage
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

*Phase 6f focuses on moving all mobile/touch-related hooks to be colocated with their respective mobile functionality, ensuring clear ownership and maintainability.*
