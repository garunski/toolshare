# Phase 6c: Admin Hooks Migration

## 🎯 Objective
Move 4 admin-related hook files from `src/common/hooks/` to be colocated with their respective admin functionality.

---

## 📋 Files to Migrate (4 files)

### 1. `useUserRoles.ts` → `/app/admin/users/hooks/useUserRoles.ts`
**Size:** 2.2KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/admin/users/hooks/`
- [x] Copy `useUserRoles.ts` to the new location
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for user roles data
- [x] Add proper error handling for user roles operations
- [x] Create corresponding `index.ts` file for exports
- [x] Update all imports in codebase that reference `useUserRoles.ts`


### 2. `usePermissions.ts` → `/app/admin/hooks/usePermissions.ts`
**Size:** 1.8KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/admin/hooks/`
- [x] Copy `usePermissions.ts` to the new location
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for permissions data
- [x] Add proper error handling for permissions operations
- [x] Create corresponding `index.ts` file for exports
- [x] Update all imports in codebase that reference `usePermissions.ts`


### 3. `useRealtimeAdminData.ts` → `/app/admin/hooks/useRealtimeAdminData.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [x] Copy `useRealtimeAdminData.ts` to the same directory as usePermissions.ts
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for realtime admin data
- [x] Add proper error handling for realtime operations
- [x] Add proper cleanup for realtime subscriptions
- [x] Update all imports in codebase that reference `useRealtimeAdminData.ts`


### 4. `useAttributeHook.ts` → `/app/admin/attributes/hooks/useAttributeHook.ts`
**Size:** 1.0KB | **Complexity:** Low

**Subtasks:**
- [x] Create directory: `src/app/admin/attributes/hooks/`
- [x] Copy `useAttributeHook.ts` to the new location
- [x] Update imports to use relative paths and local dependencies
- [x] Add proper TypeScript types for attribute hook data
- [x] Add proper error handling for attribute operations
- [x] Create corresponding `index.ts` file for exports
- [x] Update all imports in codebase that reference `useAttributeHook.ts`


---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/admin/users/hooks
mkdir -p src/app/admin/hooks
mkdir -p src/app/admin/attributes/hooks
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Index Files
For each hooks directory, create an `index.ts` file that exports the hooks.

### Step 5: Validate Each Migration
After each file is moved, run `task validate` and fix all issues.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [x] All 4 admin hook files moved to appropriate admin directories
- [x] All imports updated to use relative paths
- [x] All corresponding `index.ts` files created
- [x] All imports in codebase updated to reference new locations

### ✅ Functionality Verification
- [x] useUserRoles hook works correctly
- [x] usePermissions hook works correctly
- [x] useRealtimeAdminData hook works correctly
- [x] useAttributeHook hook works correctly
- [x] All admin functionality preserved

### ✅ Code Quality Verification
- [x] Run `task validate` to ensure no TypeScript errors
- [x] All hook logic preserved after moving
- [x] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 4 admin hook files moved to admin-specific directories
- ✅ Hooks colocated with their usage
- ✅ All imports updated to use new locations
- ✅ All corresponding index files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

## ✅ Phase 6c Complete!

All admin hooks have been successfully migrated and colocated with their respective functionality. The migration included:

1. **useUserRoles.ts** → `src/app/admin/users/hooks/useUserRoles.ts`
2. **usePermissions.ts** → `src/app/admin/hooks/usePermissions.ts`
3. **useRealtimeAdminData.ts** → `src/app/admin/hooks/useRealtimeAdminData.ts`
4. **useAttributeHook.ts** → `src/app/admin/attributes/hooks/useAttributeHook.ts`

### Key Accomplishments:
- ✅ All hooks successfully moved to appropriate admin directories
- ✅ All import paths updated to use correct path mappings (`@/admin/*`)
- ✅ Index files created for proper exports
- ✅ All functionality preserved and validated
- ✅ Code quality maintained with proper formatting
- ✅ Build validation passed successfully

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

*Phase 6c focuses on moving all admin-related hooks to be colocated with their respective admin functionality, ensuring clear ownership and maintainability.*
