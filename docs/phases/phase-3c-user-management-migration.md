# Phase 3c: User Management Operations Migration

## 🎯 Objective
Move 8 user management operation files from `src/common/operations/` to be colocated with API routes in `/api/admin/users/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (8 files)

### 1. `userCreation.ts` → `/api/admin/users/create/performUser.ts`
**Size:** 3.7KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/create/`
- [ ] Copy `userCreation.ts` to `performUser.ts`
- [ ] Refactor function names to be specific (e.g., `performUser`, `performUserCreation`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add proper admin permission validation
- [ ] Add user data validation and sanitization
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `userCreation.ts`

### 2. `sessionStateHandler.ts` → `/api/admin/users/sessions/handleSession.ts`
**Size:** 2.6KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/sessions/`
- [ ] Copy `sessionStateHandler.ts` to `handleSession.ts`
- [ ] Refactor function names to be specific (e.g., `handleSession`, `manageSessionState`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add session state management logic
- [ ] Add session validation and cleanup
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `sessionStateHandler.ts`
- [ ] Run `task validate` and fix all issues

### 3. `sessionValidation.ts` → `/api/admin/users/sessions/validateSession.ts`
**Size:** 1.7KB | **Complexity:** Low

**Subtasks:**
- [ ] Copy `sessionValidation.ts` to `validateSession.ts` (same directory as above)
- [ ] Refactor function names to be specific (e.g., `validateSession`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add session validation logic
- [ ] Update all imports in codebase that reference `sessionValidation.ts`
- [ ] Run `task validate` and fix all issues

### 4. `authListener.ts` → `/api/admin/users/auth/listenAuth.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/auth/`
- [ ] Copy `authListener.ts` to `listenAuth.ts`
- [ ] Refactor function names to be specific (e.g., `listenAuth`, `handleAuthEvents`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add authentication event handling logic
- [ ] Add real-time auth monitoring
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `authListener.ts`
- [ ] Run `task validate` and fix all issues

### 5. `gdprComplianceManager.ts` → `/api/admin/users/compliance/manageGDPR.ts`
**Size:** 3.8KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/compliance/`
- [ ] Copy `gdprComplianceManager.ts` to `manageGDPR.ts`
- [ ] Refactor function names to be specific (e.g., `manageGDPR`, `handleGDPRRequest`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add GDPR compliance logic (data export, deletion, consent)
- [ ] Add data privacy validation
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `gdprComplianceManager.ts`
- [ ] Run `task validate` and fix all issues

### 6. `dataRetentionManager.ts` → `/api/admin/users/retention/manageDataRetention.ts`
**Size:** 3.3KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/retention/`
- [ ] Copy `dataRetentionManager.ts` to `manageDataRetention.ts`
- [ ] Refactor function names to be specific (e.g., `manageDataRetention`, `handleDataRetention`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add data retention policy logic
- [ ] Add automated data cleanup
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `dataRetentionManager.ts`
- [ ] Run `task validate` and fix all issues

### 7. `securityManager.ts` → `/api/admin/users/security/manageSecurity.ts`
**Size:** 3.2KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/security/`
- [ ] Copy `securityManager.ts` to `manageSecurity.ts`
- [ ] Refactor function names to be specific (e.g., `manageSecurity`, `handleSecurityEvents`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add security monitoring and threat detection
- [ ] Add security policy enforcement
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `securityManager.ts`
- [ ] Run `task validate` and fix all issues

### 8. `autoPopulationEngine.ts` → `/api/admin/users/populate/autoPopulate.ts`
**Size:** 3.4KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/users/populate/`
- [ ] Copy `autoPopulationEngine.ts` to `autoPopulate.ts`
- [ ] Refactor function names to be specific (e.g., `autoPopulate`, `handleAutoPopulation`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add automatic data population logic
- [ ] Add population validation and error handling
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `autoPopulationEngine.ts`
- [ ] Run `task validate` and fix all issues

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
- [ ] All 8 user management operation files moved to appropriate API routes
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

- ✅ All 8 user management operation files moved to `/api/admin/users/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3c focuses on moving all user management business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
