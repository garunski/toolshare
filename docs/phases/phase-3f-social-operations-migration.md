# Phase 3f: Social Operations Migration

## 🎯 Objective
Move 8 social operation files from `src/common/operations/` to be colocated with API routes in `/api/(app)/social/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (8 files)

### 1. `friendOperations.ts` → `/api/(app)/social/friends/request/performFriendRequest.ts`
**Size:** 3.7KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/friends/request/`
- [ ] Copy `friendOperations.ts` to `performFriendRequest.ts`
- [ ] Refactor function names to be specific (e.g., `performFriendRequest`, `sendFriendRequest`, `acceptFriendRequest`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add friend request validation logic
- [ ] Add duplicate request prevention
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `friendOperations.ts`

### 2. `friendRequestProcessor.ts` → `/api/(app)/social/friends/process/processFriendRequest.ts`
**Size:** 3.4KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/friends/process/`
- [ ] Copy `friendRequestProcessor.ts` to `processFriendRequest.ts`
- [ ] Refactor function names to be specific (e.g., `processFriendRequest`, `handleFriendRequest`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add friend request processing logic
- [ ] Add notification handling for friend requests
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `friendRequestProcessor.ts`

### 3. `friendRequestQueries.ts` → `/api/(app)/social/friends/list/getFriendRequests.ts`
**Size:** 1.7KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/friends/list/`
- [ ] Copy `friendRequestQueries.ts` to `getFriendRequests.ts`
- [ ] Refactor function names to be specific (e.g., `getFriendRequests`, `getPendingRequests`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add friend request querying logic
- [ ] Add filtering and pagination support
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `friendRequestQueries.ts`

### 4. `friendRequestValidator.ts` → `/api/(app)/social/friends/validate/validateFriendRequest.ts`
**Size:** 1.0KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/friends/validate/`
- [ ] Copy `friendRequestValidator.ts` to `validateFriendRequest.ts`
- [ ] Refactor function names to be specific (e.g., `validateFriendRequest`, `checkFriendRequestValidity`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add friend request validation logic
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `friendRequestValidator.ts`

### 5. `messageOperations.ts` → `/api/(app)/social/messages/send/performMessage.ts`
**Size:** 2.5KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/messages/send/`
- [ ] Copy `messageOperations.ts` to `performMessage.ts`
- [ ] Refactor function names to be specific (e.g., `performMessage`, `sendMessage`, `deleteMessage`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add message sending and management logic
- [ ] Add message validation and sanitization
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `messageOperations.ts`

### 6. `conversationOperations.ts` → `/api/(app)/social/conversations/performConversation.ts`
**Size:** 2.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/conversations/`
- [ ] Copy `conversationOperations.ts` to `performConversation.ts`
- [ ] Refactor function names to be specific (e.g., `performConversation`, `createConversation`, `getConversation`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add conversation management logic
- [ ] Add conversation threading and organization
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `conversationOperations.ts`

### 7. `socialConnectionProcessor.ts` → `/api/(app)/social/connections/processConnections.ts`
**Size:** 2.7KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/connections/`
- [ ] Copy `socialConnectionProcessor.ts` to `processConnections.ts`
- [ ] Refactor function names to be specific (e.g., `processConnections`, `manageSocialConnections`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add social connection processing logic
- [ ] Add connection status management
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `socialConnectionProcessor.ts`

### 8. `socialProfileOperations.ts` → `/api/(app)/social/profiles/performProfileOperation.ts`
**Size:** 1.7KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/(app)/social/profiles/`
- [ ] Copy `socialProfileOperations.ts` to `performProfileOperation.ts`
- [ ] Refactor function names to be specific (e.g., `performProfileOperation`, `updateSocialProfile`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add social profile management logic
- [ ] Add profile visibility and privacy settings
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `socialProfileOperations.ts`

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/\(app\)/social/friends/request
mkdir -p src/app/api/\(app\)/social/friends/process
mkdir -p src/app/api/\(app\)/social/friends/list
mkdir -p src/app/api/\(app\)/social/friends/validate
mkdir -p src/app/api/\(app\)/social/messages/send
mkdir -p src/app/api/\(app\)/social/conversations
mkdir -p src/app/api/\(app\)/social/connections
mkdir -p src/app/api/\(app\)/social/profiles
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
- [ ] All 8 social operation files moved to appropriate API routes
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

- ✅ All 8 social operation files moved to `/api/(app)/social/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3f focuses on moving all social business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
