# Phase 3: Business Logic Migration - Incremental Plan

## 🎯 Overview
Phase 3 is the largest refactoring phase, moving 60+ operation files from `src/common/operations/` to be colocated with API routes. This plan breaks it down into manageable, incremental steps.

---

## 📋 Phase Breakdown

### Phase 3a: Analysis and Preparation
**Objective:** Understand current state and prepare for migration
- [ ] Audit all operation files in `src/common/operations/`
- [ ] Map operations to their target API routes
- [ ] Create migration tracking document
- [ ] Set up backup of current operations directory

### Phase 3b: Tool Operations Migration
**Objective:** Move tool-related business logic
- [ ] Move `toolCRUD.ts` → `src/app/api/(app)/tools/create/performTool.ts`
- [ ] Move `toolQueries.ts` → `src/app/api/(app)/tools/list/getTools.ts`
- [ ] Create `src/app/api/(app)/tools/[id]/update/performToolUpdate.ts`
- [ ] Create `src/app/api/(app)/tools/[id]/delete/performToolDelete.ts`
- [ ] Update imports for tool operations
- [ ] Create corresponding API route files

### Phase 3c: User Management Operations Migration
**Objective:** Move user-related business logic to admin routes
- [ ] Move `userCreation.ts` → `src/app/api/admin/users/create/performUser.ts`
- [ ] Move `userQueries.ts` → `src/app/api/admin/users/list/getUsers.ts`
- [ ] Move `userUpdate.ts` → `src/app/api/admin/users/[userId]/update/performUserUpdate.ts`
- [ ] Move `userDelete.ts` → `src/app/api/admin/users/[userId]/delete/performUserDelete.ts`
- [ ] Update imports for user operations
- [ ] Create corresponding API route files

### Phase 3d: Loan Operations Migration
**Objective:** Move loan-related business logic
- [ ] Move `loanOperations.ts` → `src/app/api/(app)/loans/create/performLoan.ts`
- [ ] Move `loanQueries.ts` → `src/app/api/(app)/loans/list/getLoans.ts`
- [ ] Move `loanStatusUpdate.ts` → `src/app/api/(app)/loans/[id]/update/performLoanUpdate.ts`
- [ ] Update imports for loan operations
- [ ] Create corresponding API route files

### Phase 3e: Social Operations Migration
**Objective:** Move social-related business logic
- [ ] Move `friendOperations.ts` → `src/app/api/(app)/social/friends/request/performFriendRequest.ts`
- [ ] Move `friendQueries.ts` → `src/app/api/(app)/social/friends/list/getFriends.ts`
- [ ] Move `messageOperations.ts` → `src/app/api/(app)/social/messages/send/performMessage.ts`
- [ ] Move `messageQueries.ts` → `src/app/api/(app)/social/messages/list/getMessages.ts`
- [ ] Update imports for social operations
- [ ] Create corresponding API route files

### Phase 3f: Authentication Operations Migration
**Objective:** Move auth-related business logic
- [ ] Move `loginOperations.ts` → `src/app/api/(auth)/login/performLogin.ts`
- [ ] Move `registerOperations.ts` → `src/app/api/(auth)/register/performRegister.ts`
- [ ] Update imports for auth operations
- [ ] Create corresponding API route files

### Phase 3g: Role and Permission Operations Migration
**Objective:** Move role and permission-related business logic
- [ ] Move `roleAssignments.ts` → `src/app/api/admin/roles/assign/performRoleAssignment.ts`
- [ ] Move `roleQueries.ts` → `src/app/api/admin/roles/list/getRoles.ts`
- [ ] Move permission-related operations to appropriate admin routes
- [ ] Update imports for role operations
- [ ] Create corresponding API route files

### Phase 3h: Category and Attribute Operations Migration
**Objective:** Move category and attribute-related business logic
- [ ] Move category operations to admin taxonomy routes
- [ ] Move attribute operations to admin attribute routes
- [ ] Update imports for category/attribute operations
- [ ] Create corresponding API route files

### Phase 3i: Profile Operations Migration
**Objective:** Move profile-related business logic
- [ ] Move profile operations to appropriate API routes
- [ ] Update imports for profile operations
- [ ] Create corresponding API route files

### Phase 3j: Advanced Search Operations Migration
**Objective:** Move search-related business logic
- [ ] Move `advancedSearchCore.ts` → appropriate search API routes
- [ ] Move `advancedSearchEngine.ts` → appropriate search API routes
- [ ] Move `advancedSearchAnalytics.ts` → appropriate analytics API routes
- [ ] Update imports for search operations
- [ ] Create corresponding API route files

### Phase 3k: Remaining Operations Migration
**Objective:** Move any remaining operation files
- [ ] Identify and move any remaining operation files
- [ ] Update all remaining imports
- [ ] Create corresponding API route files

### Phase 3l: Cleanup and Validation
**Objective:** Final cleanup and validation
- [ ] Remove empty `src/common/operations/` directory
- [ ] Update any remaining import references
- [ ] Run comprehensive validation with `task validate`
- [ ] Test all API endpoints
- [ ] Verify no functionality is broken

---

## 🚀 Implementation Strategy

### For Each Sub-Phase:
1. **Read the specific sub-phase objectives**
2. **Identify the operation files to move**
3. **Create the target directory structure**
4. **Move and refactor the operation files**
5. **Update import statements**
6. **Create corresponding API route files**
7. **Test the changes with `task validate`**
8. **Move to next sub-phase only after validation passes**

### Safety Measures:
- Each sub-phase is independent and can be validated separately
- Backup of original operations directory maintained
- Incremental validation after each sub-phase
- Rollback capability if issues arise

---

## 📊 Progress Tracking

| Sub-Phase | Status | Files Moved | Validation Status |
|-----------|--------|-------------|-------------------|
| 3a | 🔄 Ready | 0 | N/A |
| 3b | ⏳ Pending | 0 | N/A |
| 3c | ⏳ Pending | 0 | N/A |
| 3d | ⏳ Pending | 0 | N/A |
| 3e | ⏳ Pending | 0 | N/A |
| 3f | ⏳ Pending | 0 | N/A |
| 3g | ⏳ Pending | 0 | N/A |
| 3h | ⏳ Pending | 0 | N/A |
| 3i | ⏳ Pending | 0 | N/A |
| 3j | ⏳ Pending | 0 | N/A |
| 3k | ⏳ Pending | 0 | N/A |
| 3l | ⏳ Pending | 0 | N/A |

---

## 🎯 Success Criteria

- ✅ All 60+ operation files moved to appropriate API routes
- ✅ Business logic colocated with API endpoints
- ✅ Clear ownership of business operations
- ✅ No business logic remaining in `src/common/operations/`
- ✅ All imports updated to use new locations
- ✅ API routes properly structured and functional
- ✅ All existing functionality preserved
- ✅ Comprehensive validation passes

---

*This incremental approach makes Phase 3 manageable by breaking it into 12 smaller, focused sub-phases that can be completed and validated independently.*
