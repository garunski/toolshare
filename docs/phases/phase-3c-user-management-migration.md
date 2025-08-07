# Phase 3c: User Management Operations Migration

## 🎯 Objective
Move 8 user management operation files from `src/common/operations/` to be colocated with API routes in `/api/admin/users/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (8 files)

### 1. `userCreation.ts` → `/api/admin/users/create/performUser.ts`
**Size:** 3.7KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/create/`
- [x] Copy `userCreation.ts` to `performUser.ts`
- [x] Refactor function names to be specific (e.g., `performUser`, `performUserCreation`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add proper admin permission validation
- [x] Add user data validation and sanitization
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `userCreation.ts`

### 2. `sessionStateHandler.ts` → `/api/admin/users/sessions/handleSession.ts`
**Size:** 2.6KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/sessions/`
- [x] Copy `sessionStateHandler.ts` to `handleSession.ts`
- [x] Refactor function names to be specific (e.g., `handleSession`, `manageSessionState`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add session state management logic
- [x] Add session validation and cleanup
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `sessionStateHandler.ts`
- [x] Run `task validate` and fix all issues

### 3. `sessionValidation.ts` → `/api/admin/users/sessions/validateSession.ts`
**Size:** 1.7KB | **Complexity:** Low

**Subtasks:**
- [x] Copy `sessionValidation.ts` to `validateSession.ts` (same directory as above)
- [x] Refactor function names to be specific (e.g., `validateSession`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add session validation logic
- [x] Update all imports in codebase that reference `sessionValidation.ts`
- [x] Run `task validate` and fix all issues

### 4. `authListener.ts` → `/api/admin/users/auth/listenAuth.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/auth/`
- [x] Copy `authListener.ts` to `listenAuth.ts`
- [x] Refactor function names to be specific (e.g., `listenAuth`, `handleAuthEvents`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add authentication event handling logic
- [x] Add real-time auth monitoring
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `authListener.ts`
- [x] Run `task validate` and fix all issues

### 5. `gdprComplianceManager.ts` → `/api/admin/users/compliance/manageGDPR.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/compliance/`
- [x] Copy `gdprComplianceManager.ts` to `manageGDPR.ts`
- [x] Refactor function names to be specific (e.g., `manageGDPR`, `handleGDPRRequest`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add GDPR compliance logic (data export, deletion, consent)
- [x] Add data privacy validation
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `gdprComplianceManager.ts`
- [x] Run `task validate` and fix all issues

### 6. `dataRetentionManager.ts` → `/api/admin/users/retention/manageDataRetention.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/retention/`
- [x] Copy `dataRetentionManager.ts` to `manageDataRetention.ts`
- [x] Refactor function names to be specific (e.g., `manageDataRetention`, `handleDataRetention`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add data retention policy logic
- [x] Add automated data cleanup
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `dataRetentionManager.ts`
- [x] Run `task validate` and fix all issues

### 7. `securityManager.ts` → `/api/admin/users/security/manageSecurity.ts`
**Size:** 3.2KB | **Complexity:** High

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/security/`
- [x] Copy `securityManager.ts` to `manageSecurity.ts`
- [x] Refactor function names to be specific (e.g., `manageSecurity`, `handleSecurityEvents`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add security monitoring and threat detection
- [x] Add security policy enforcement
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `securityManager.ts`
- [x] Run `task validate` and fix all issues

### 8. `autoPopulationEngine.ts` → `/api/admin/users/populate/autoPopulate.ts`
**Size:** 3.4KB | **Complexity:** Medium

**Subtasks:**
- [x] Create directory: `src/app/api/admin/users/populate/`
- [x] Copy `autoPopulationEngine.ts` to `autoPopulate.ts`
- [x] Refactor function names to be specific (e.g., `autoPopulate`, `handleAutoPopulation`)
- [x] Update imports to use `@/common/supabase/server`
- [x] Add automatic data population logic
- [x] Add population validation and error handling
- [x] Create corresponding `route.ts` file
- [x] Update all imports in codebase that reference `autoPopulationEngine.ts`
- [x] Run `task validate` and fix all issues

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/users/create
mkdir -p src/app/api/admin/users/sessions
mkdir -p src/app/api/admin/users/auth
mkdir -p src/app/api/admin/users/compliance
mkdir -p src/app/api/admin/users/retention
mkdir -p src/app/api/admin/users/security
mkdir -p src/app/api/admin/users/populate
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
- [x] All 8 user management operation files moved to appropriate API routes
- [x] All function names refactored to be specific and descriptive
- [x] All imports updated to use `@/common/supabase/server`
- [x] All corresponding `route.ts` files created
- [x] All imports in codebase updated to reference new locations

### ✅ Code Quality Verification
- [x] Run `task validate` to ensure no TypeScript errors
- [x] Run `task dev:code-quality` to ensure code quality standards
- [x] All business logic preserved after moving
- [x] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 8 user management operation files moved to `/api/admin/users/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3c focuses on moving all user management business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
