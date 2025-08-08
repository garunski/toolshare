# Phase 8g: Complex API Route Updates

## 🎯 Objective
Update complex API routes with search, filtering, pagination, and dynamic operations to use the new error handling and middleware headers.

---

## 📋 Target Files (20 files)

### 1. `src/app/api/(app)/tools/create/route.ts` - Tool Creation
**Current State:** Complex tool creation with validation
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update validation to use new error format
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 2. `src/app/api/(app)/tools/[id]/route.ts` - Tool Details
**Current State:** Dynamic tool operations with complex logic
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update dynamic route handling
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 3. `src/app/api/(app)/tools/[id]/owner/route.ts` - Tool Ownership
**Current State:** Ownership transfer operations
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Add ownership validation logic
- [ ] Update error responses to use consistent format
- [ ] Run `task validate` and fix any issues

### 4. `src/app/api/(app)/search/route.ts` - Search Operations
**Current State:** Complex search with filters and pagination
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update search parameter validation
- [ ] Add proper error handling for search failures
- [ ] Run `task validate` and fix any issues

### 5. `src/app/api/(app)/social/route.ts` - Social Operations
**Current State:** Social features with complex interactions
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update social interaction validation
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 6. `src/app/api/admin/users/[userId]/roles/route.ts` - User Role Management
**Current State:** Dynamic user role operations
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update dynamic route handling
- [ ] Run `task validate` and fix any issues

### 7. `src/app/api/admin/categories/route.ts` - Category Management
**Current State:** Category CRUD with complex validation
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update category validation logic
- [ ] Run `task validate` and fix any issues

### 8. `src/app/api/admin/attributes/route.ts` - Attribute Management
**Current State:** Attribute operations with complex logic
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update attribute validation logic
- [ ] Run `task validate` and fix any issues

### 9. `src/app/api/admin/analytics/route.ts` - Analytics Operations
**Current State:** Complex analytics with data processing
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update analytics error handling
- [ ] Run `task validate` and fix any issues

### 10. `src/app/api/admin/system/route.ts` - System Operations
**Current State:** System-level operations with high complexity
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update system operation error handling
- [ ] Run `task validate` and fix any issues

### 11. `src/app/api/admin/taxonomy/route.ts` - Taxonomy Management
**Current State:** Taxonomy operations with complex relationships
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update taxonomy validation logic
- [ ] Run `task validate` and fix any issues

### 12. `src/app/api/(app)/loans/status/route.ts` - Loan Status
**Current State:** Loan status operations with complex state management
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update loan status validation
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 13. `src/app/api/(app)/loans/realtime/route.ts` - Real-time Loans
**Current State:** Real-time loan operations with WebSocket-like logic
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update real-time operation error handling
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 14. `src/app/api/(app)/social/messages/route.ts` - Message Operations
**Current State:** Message handling with complex threading
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update message validation logic
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 15. `src/app/api/(app)/social/profile/route.ts` - Social Profile
**Current State:** Social profile operations with complex data
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read user ID from middleware headers
- [ ] Update profile validation logic
- [ ] Add proper user context validation
- [ ] Run `task validate` and fix any issues

### 16. `src/app/api/admin/subscriptions/route.ts` - Subscription Management
**Current State:** Subscription operations with billing logic
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update subscription error handling
- [ ] Run `task validate` and fix any issues

### 17. `src/app/api/admin/analytics/users/route.ts` - User Analytics
**Current State:** User analytics with complex data aggregation
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update analytics error handling
- [ ] Run `task validate` and fix any issues

### 18. `src/app/api/admin/analytics/tools/route.ts` - Tool Analytics
**Current State:** Tool analytics with complex metrics
**Complexity:** ⭐⭐⭐⭐ Very High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update analytics error handling
- [ ] Run `task validate` and fix any issues

### 19. `src/app/api/admin/system/rateLimit/route.ts` - Rate Limit Management
**Current State:** Rate limit configuration and management
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update rate limit error handling
- [ ] Run `task validate` and fix any issues

### 20. `src/app/api/admin/system/rateLimit/helpers/route.ts` - Rate Limit Helpers
**Current State:** Rate limit helper operations
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Add error handling with handleApiError
- [ ] Read admin context from middleware headers
- [ ] Add proper admin role validation
- [ ] Update helper error handling
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Complex Error Handling Template
```typescript
// Before: Complex error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Complex validation logic
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Missing required field' }, { status: 400 });
    }
    
    // Complex business logic
    const result = await complexOperation(body);
    
    return Response.json(result);
  } catch (error) {
    console.error('Complex error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
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
    
    // Complex validation with proper error handling
    if (!body.requiredField) {
      throw new ApiError(400, 'Missing required field', 'MISSING_FIELD');
    }
    
    // Complex business logic
    const result = await complexOperation(body);
    
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Dynamic Route Handling
```typescript
// Handle dynamic routes with proper error handling
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }
    
    // Validate dynamic parameter
    if (!params.id) {
      throw new ApiError(400, 'Invalid ID parameter', 'INVALID_ID');
    }
    
    // Complex dynamic operation
    const result = await getDynamicData(params.id, userId);
    
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Admin Context Validation
```typescript
// Validate admin context for complex operations
const userRole = request.headers.get('x-user-role');
if (userRole !== 'admin') {
  throw new ApiError(403, 'Admin access required', 'ADMIN_REQUIRED');
}

// Complex admin operation with proper error handling
const result = await complexAdminOperation(body);
```

---

## ✅ Verification Checklist

### File Update Verification
- [ ] All 20 complex API routes updated with error handling
- [ ] User context properly read from headers
- [ ] Admin context properly validated
- [ ] Dynamic routes properly handled
- [ ] Complex validation logic updated

### Code Quality Verification
- [ ] All routes use handleApiError function
- [ ] User ID validation in protected routes
- [ ] Admin role validation in admin routes
- [ ] Dynamic route parameters properly validated
- [ ] Complex business logic properly error handled
- [ ] TypeScript types correctly defined

### Functionality Verification
- [ ] Error handling works consistently across complex routes
- [ ] User context available in route handlers
- [ ] Admin routes properly protected
- [ ] Dynamic routes handle errors correctly
- [ ] Complex operations fail gracefully
- [ ] Authentication validation working
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 20 complex API routes updated with error handling
- ✅ User context properly read from middleware headers
- ✅ Admin context properly validated in admin routes
- ✅ Dynamic routes properly handle errors
- ✅ Complex validation logic updated
- ✅ Consistent error response format across all routes
- ✅ Authentication validation working correctly
- ✅ All routes use centralized error handling
- ✅ `task validate` passes without errors

---

*Phase 8g updates complex API routes to use the new error handling and middleware context, ensuring robust error handling for advanced operations.*
