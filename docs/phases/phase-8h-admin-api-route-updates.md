# Phase 8h: Admin API Route Updates

## 🎯 Objective
Update remaining admin API routes to use the new error handling and middleware headers, focusing on administrative operations that require RBAC validation.

---

## 📋 Target Files (15 files)

### 1. `src/app/api/admin/users/create/route.ts` - User Creation
**Current State:** Admin user creation without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update user creation validation
- [ ] Run `task validate` and fix any issues

### 2. `src/app/api/admin/users/update/route.ts` - User Updates
**Current State:** Admin user updates without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update user update validation
- [ ] Run `task validate` and fix any issues

### 3. `src/app/api/admin/users/delete/route.ts` - User Deletion
**Current State:** Admin user deletion without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update user deletion validation
- [ ] Run `task validate` and fix any issues

### 4. `src/app/api/admin/roles/create/route.ts` - Role Creation
**Current State:** Admin role creation without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update role creation validation
- [ ] Run `task validate` and fix any issues

### 5. `src/app/api/admin/roles/update/route.ts` - Role Updates
**Current State:** Admin role updates without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update role update validation
- [ ] Run `task validate` and fix any issues

### 6. `src/app/api/admin/roles/delete/route.ts` - Role Deletion
**Current State:** Admin role deletion without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update role deletion validation
- [ ] Run `task validate` and fix any issues

### 7. `src/app/api/admin/categories/create/route.ts` - Category Creation
**Current State:** Admin category creation without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update category creation validation
- [ ] Run `task validate` and fix any issues

### 8. `src/app/api/admin/categories/update/route.ts` - Category Updates
**Current State:** Admin category updates without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update category update validation
- [ ] Run `task validate` and fix any issues

### 9. `src/app/api/admin/categories/delete/route.ts` - Category Deletion
**Current State:** Admin category deletion without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update category deletion validation
- [ ] Run `task validate` and fix any issues

### 10. `src/app/api/admin/attributes/create/route.ts` - Attribute Creation
**Current State:** Admin attribute creation without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update attribute creation validation
- [ ] Run `task validate` and fix any issues

### 11. `src/app/api/admin/attributes/update/route.ts` - Attribute Updates
**Current State:** Admin attribute updates without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update attribute update validation
- [ ] Run `task validate` and fix any issues

### 12. `src/app/api/admin/attributes/delete/route.ts` - Attribute Deletion
**Current State:** Admin attribute deletion without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update attribute deletion validation
- [ ] Run `task validate` and fix any issues

### 13. `src/app/api/admin/taxonomy/create/route.ts` - Taxonomy Creation
**Current State:** Admin taxonomy creation without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update taxonomy creation validation
- [ ] Run `task validate` and fix any issues

### 14. `src/app/api/admin/taxonomy/update/route.ts` - Taxonomy Updates
**Current State:** Admin taxonomy updates without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update taxonomy update validation
- [ ] Run `task validate` and fix any issues

### 15. `src/app/api/admin/taxonomy/delete/route.ts` - Taxonomy Deletion
**Current State:** Admin taxonomy deletion without error handling
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update taxonomy deletion validation
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Admin Error Handling Template
```typescript
// Before: Admin route without error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Admin validation logic
    if (!body.adminField) {
      return NextResponse.json({ error: 'Admin field required' }, { status: 400 });
    }
    
    // Admin business logic
    const result = await adminOperation(body);
    
    return Response.json(result);
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Admin operation failed' }, { status: 500 });
  }
}

// After: Admin route with centralized error handling
import { handleApiError, ApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get admin context from middleware
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      throw new ApiError(403, 'Admin access required', 'ADMIN_REQUIRED');
    }
    
    // Admin validation with proper error handling
    if (!body.adminField) {
      throw new ApiError(400, 'Admin field required', 'MISSING_ADMIN_FIELD');
    }
    
    // Admin business logic
    const result = await adminOperation(body);
    
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Admin Context Validation
```typescript
// Validate admin context for all admin operations
const userRole = request.headers.get('x-user-role');
if (userRole !== 'admin') {
  throw new ApiError(403, 'Admin access required', 'ADMIN_REQUIRED');
}

// Additional admin-specific validation
const adminUserId = request.headers.get('x-user-id');
if (!adminUserId) {
  throw new ApiError(401, 'Admin user not authenticated', 'ADMIN_UNAUTHORIZED');
}
```

### Admin CRUD Operations
```typescript
// Admin creation operation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Admin validation
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }
    
    // Admin creation logic
    const result = await createAdminResource(body);
    
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// Admin update operation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Admin validation
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }
    
    // Admin update logic
    const result = await updateAdminResource(body);
    
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// Admin deletion operation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Admin validation
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }
    
    // Admin deletion logic
    await deleteAdminResource(id);
    
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## ✅ Verification Checklist

### File Update Verification
- [ ] All 15 admin API routes updated with error handling
- [ ] Admin context properly read from headers
- [ ] Admin role validation implemented
- [ ] CRUD operations properly handled

### Code Quality Verification
- [ ] All routes use handleApiError function
- [ ] Admin role validation in all admin routes
- [ ] Proper error codes and messages for admin operations
- [ ] CRUD operations properly error handled
- [ ] TypeScript types correctly defined

### Functionality Verification
- [ ] Error handling works consistently across admin routes
- [ ] Admin context available in route handlers
- [ ] Admin routes properly protected
- [ ] CRUD operations fail gracefully
- [ ] Authentication validation working
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 15 admin API routes updated with error handling
- ✅ Admin context properly read from middleware headers
- ✅ Admin role validation implemented in all routes
- ✅ CRUD operations properly handled
- ✅ Consistent error response format across all admin routes
- ✅ Authentication validation working correctly
- ✅ All routes use centralized error handling
- ✅ `task validate` passes without errors

---

*Phase 8h updates admin API routes to use the new error handling and middleware context, ensuring proper RBAC validation for all administrative operations.*
