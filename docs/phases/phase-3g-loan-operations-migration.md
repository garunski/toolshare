# Phase 3g: Loan Operations Migration

## 🎯 Objective
Move 3 loan operation files from `src/common/operations/` to be colocated with API routes in `/api/(app)/loans/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (3 files)

### 1. `loanStatusOperations.ts` → `/api/(app)/loans/status/performStatusUpdate.ts`
**Size:** 2.1KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/loans/status/`
- [ ] Copy `loanStatusOperations.ts` to `performStatusUpdate.ts`
- [ ] Refactor function names to be specific (e.g., `performStatusUpdate`, `updateLoanStatus`, `getLoanStatus`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add loan status update validation logic
- [ ] Add status transition rules and validation
- [ ] Add notification handling for status changes
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `loanStatusOperations.ts`

### 2. `loanStatusTracker.ts` → `/api/(app)/loans/tracking/trackLoanStatus.ts`
**Size:** 2.1KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/loans/tracking/`
- [ ] Copy `loanStatusTracker.ts` to `trackLoanStatus.ts`
- [ ] Refactor function names to be specific (e.g., `trackLoanStatus`, `getLoanTracking`, `updateLoanTracking`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add loan status tracking logic
- [ ] Add tracking history and audit trail
- [ ] Add automated status updates based on time/conditions
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `loanStatusTracker.ts`

### 3. `realtimeConnectionManager.ts` → `/api/(app)/loans/realtime/manageConnections.ts`
**Size:** 4.1KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/loans/realtime/`
- [ ] Copy `realtimeConnectionManager.ts` to `manageConnections.ts`
- [ ] Refactor function names to be specific (e.g., `manageConnections`, `handleRealtimeConnection`, `broadcastLoanUpdate`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add real-time connection management logic
- [ ] Add WebSocket connection handling
- [ ] Add real-time loan status broadcasting
- [ ] Add connection pooling and optimization
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `realtimeConnectionManager.ts`

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/\(app\)/loans/status
mkdir -p src/app/api/\(app\)/loans/tracking
mkdir -p src/app/api/\(app\)/loans/realtime
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Route Files
For each moved operation file, create a corresponding `route.ts` file that uses the business logic.

### Step 5: Test Each Migration
After each file is moved, test the functionality to ensure it works correctly.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 3 loan operation files moved to appropriate API routes
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

- ✅ All 3 loan operation files moved to `/api/(app)/loans/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3g focuses on moving all loan business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
