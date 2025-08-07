# Phase 3d: Role and Permission Operations Migration

## 🎯 Objective
Move 6 role and permission operation files from `src/common/operations/` to be colocated with API routes in `/api/admin/roles/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (6 files)

### 1. `roleAssignments.ts` → `/api/admin/roles/assign/performRoleAssignment.ts`
**Size:** 1.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/assign/`
- [ ] Copy `roleAssignments.ts` to `performRoleAssignment.ts`
- [ ] Refactor function names to be specific (e.g., `performRoleAssignment`, `assignRoleToUser`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add role assignment validation logic
- [ ] Add permission checking for role assignment
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `roleAssignments.ts`
- [ ] Run `task validate` and fix all issues

### 2. `rolePermissions.ts` → `/api/admin/roles/permissions/managePermissions.ts`
**Size:** 899B | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/permissions/`
- [ ] Copy `rolePermissions.ts` to `managePermissions.ts`
- [ ] Refactor function names to be specific (e.g., `managePermissions`, `updateRolePermissions`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add permission management logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `rolePermissions.ts`
- [ ] Run `task validate` and fix all issues

### 3. `roleQueries.ts` → `/api/admin/roles/list/getRoles.ts`
**Size:** 2.8KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/list/`
- [ ] Copy `roleQueries.ts` to `getRoles.ts`
- [ ] Refactor function names to be specific (e.g., `getRoles`, `getRoleById`, `getUserRoles`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add role querying and filtering logic
- [ ] Add pagination support for role lists
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `roleQueries.ts`
- [ ] Run `task validate` and fix all issues

### 4. `apiRateLimiter.ts` → `/api/admin/roles/rateLimit/manageRateLimits.ts`
**Size:** 3.3KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/rateLimit/`
- [ ] Copy `apiRateLimiter.ts` to `manageRateLimits.ts`
- [ ] Refactor function names to be specific (e.g., `manageRateLimits`, `setRateLimit`, `checkRateLimit`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add rate limiting logic and configuration
- [ ] Add rate limit monitoring and reporting
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `apiRateLimiter.ts`
- [ ] Run `task validate` and fix all issues

### 5. `apiResponseHandler.ts` → `/api/admin/roles/responses/handleResponses.ts`
**Size:** 1.9KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/responses/`
- [ ] Copy `apiResponseHandler.ts` to `handleResponses.ts`
- [ ] Refactor function names to be specific (e.g., `handleResponses`, `formatApiResponse`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add standardized response handling logic
- [ ] Add error response formatting
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `apiResponseHandler.ts`
- [ ] Run `task validate` and fix all issues

### 6. `auditLoggingService.ts` → `/api/admin/roles/audit/logAuditEvents.ts`
**Size:** 3.1KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/roles/audit/`
- [ ] Copy `auditLoggingService.ts` to `logAuditEvents.ts`
- [ ] Refactor function names to be specific (e.g., `logAuditEvents`, `recordAuditEvent`, `getAuditLogs`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add audit logging logic for role changes
- [ ] Add audit log querying and filtering
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `auditLoggingService.ts`
- [ ] Run `task validate` and fix all issues

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/roles/assign
mkdir -p src/app/api/admin/roles/permissions
mkdir -p src/app/api/admin/roles/list
mkdir -p src/app/api/admin/roles/rateLimit
mkdir -p src/app/api/admin/roles/responses
mkdir -p src/app/api/admin/roles/audit
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Route Files
For each moved operation file, create a corresponding `route.ts` file that uses the business logic.

### Step 5: Test Each Migration
After each file is moved, test the functionality to ensure it works correctly.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 6 role and permission operation files moved to appropriate API routes
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `@/common/supabase/server`
- [ ] All corresponding `route.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] Run `task dev:code-quality` to ensure code quality standards
- [ ] All business logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 6 role and permission operation files moved to `/api/admin/roles/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3d focuses on moving all role and permission business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
