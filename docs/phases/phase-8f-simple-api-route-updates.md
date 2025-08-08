# Phase 8f: Simple API Route Updates

## 🎯 Objective
Update basic API routes to use the new error handling and middleware headers, focusing on simple CRUD operations that are low-risk for conversion.

---

## 📋 Target Files (10 files)

### 1. `src/app/api/(app)/tools/route.ts` - Tools CRUD
**Current State:** Basic GET/POST operations without error handling
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update imports to use new error utilities
- [ ] Add proper validation for user context
- [ ] Run `task validate` and fix any issues

### 2. `src/app/api/(app)/profiles/route.ts` - Profile Operations
**Current State:** Profile management without centralized error handling
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update error responses to use consistent format
- [ ] Add proper validation for user context
- [ ] Run `task validate` and fix any issues

### 3. `src/app/api/(app)/loans/route.ts` - Loan Operations
**Current State:** Loan management without error handling
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update error responses to use consistent format
- [ ] Add proper validation for user context
- [ ] Run `task validate` and fix any issues

### 4. `src/app/api/(public)/health/route.ts` - Health Check
**Current State:** Basic health check without error handling
**Complexity:** ⭐ Low

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Update error responses to use consistent format
- [ ] Add proper logging for health checks
- [ ] Run `task validate` and fix any issues

### 5. `src/app/api/(auth)/login/route.ts` - Login Handler
**Current State:** Login without centralized error handling
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Update error responses to use consistent format
- [ ] Add proper validation for login data
- [ ] Run `task validate` and fix any issues

### 6. `src/app/api/(auth)/register/route.ts` - Registration Handler
**Current State:** Registration without centralized error handling
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Update error responses to use consistent format
- [ ] Add proper validation for registration data
- [ ] Run `task validate` and fix any issues

### 7. `src/app/api/admin/users/route.ts` - User Management
**Current State:** Admin user operations without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update error responses to use consistent format
- [ ] Run `task validate` and fix any issues

### 8. `src/app/api/admin/roles/route.ts` - Role Management
**Current State:** Role operations without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update error responses to use consistent format
- [ ] Run `task validate` and fix any issues

### 9. `src/app/api/(app)/tools/list/route.ts` - Tool Listing
**Current State:** Tool listing without error handling
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update error responses to use consistent format
- [ ] Add proper validation for user context
- [ ] Run `task validate` and fix any issues

### 10. `src/app/api/admin/roles/list/route.ts` - Role Listing
**Current State:** Role listing without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update error responses to use consistent format
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Error Handling Template
```typescript
// Before: Basic error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... business logic
    return Response.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// After: Centralized error handling
import { handleApiError, ApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get user context from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }
    
    // ... business logic
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### User Context Reading
```typescript
// Read user ID from middleware headers
const userId = request.headers.get('x-user-id');
if (!userId) {
  throw new ApiError(401, 'User not authenticated');
}

// Read admin role from middleware headers
const userRole = request.headers.get('x-user-role');
if (userRole !== 'admin') {
  throw new ApiError(403, 'Admin access required');
}
```

### Consistent Error Format
```typescript
// All errors now return consistent format
{
  "error": "User not authenticated",
  "code": "UNAUTHORIZED"
}
```

---

## ✅ Verification Checklist

### File Update Verification
- [ ] All 10 API routes updated with error handling
- [ ] User context properly read from headers
- [ ] Admin context properly validated
- [ ] Consistent error response format

### Code Quality Verification
- [ ] All routes use handleApiError function
- [ ] User ID validation in protected routes
- [ ] Admin role validation in admin routes
- [ ] Proper error codes and messages
- [ ] TypeScript types correctly defined

### Functionality Verification
- [ ] Error handling works consistently across routes
- [ ] User context available in route handlers
- [ ] Admin routes properly protected
- [ ] Error responses follow consistent format
- [ ] Authentication validation working
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 10 simple API routes updated with error handling
- ✅ User context properly read from middleware headers
- ✅ Admin context properly validated in admin routes
- ✅ Consistent error response format across all routes
- ✅ Authentication validation working correctly
- ✅ All routes use centralized error handling
- ✅ `task validate` passes without errors

---

*Phase 8f updates simple API routes to use the new error handling and middleware context, establishing patterns for more complex route updates.*
