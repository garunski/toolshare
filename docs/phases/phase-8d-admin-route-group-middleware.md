# Phase 8d: Admin Route Group Middleware

## 🎯 Objective
Implement middleware for the `admin` route group to handle role-based access control (RBAC), stricter rate limiting, and admin-specific validation for administrative API routes while coordinating with the global middleware.

---

## 📋 Target Files (1 file)

### 1. `src/app/api/admin/middleware.ts` - Admin Route Group Middleware
**Current State:** No middleware protection on admin routes
**Complexity:** ⭐⭐⭐ High

**Sub-tasks:**
- [ ] Create middleware for `admin` route group
- [ ] Implement authentication validation with SSR client
- [ ] Add role-based access control (RBAC) with proper error handling
- [ ] Implement stricter rate limiting for admin routes using core utilities
- [ ] Pass admin context through headers
- [ ] Coordinate with global middleware for session management
- [ ] Add proper matcher configuration
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Admin Route Group Middleware Template
```typescript
// src/app/api/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  
  // Rate limiting (stricter for admin routes)
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier, RATE_LIMIT_CONFIGS.strict);
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check (global middleware already validated, but double-check)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Admin role check with proper error handling
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Admin middleware profile lookup error:', error);
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    if (profile?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('Admin middleware RBAC error:', error);
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Add admin context to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', 'admin');
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/admin/:path*']
};
```

### Route Group Structure
```typescript
// Routes covered by this middleware:
// /api/admin/users/route.ts
// /api/admin/roles/route.ts
// /api/admin/categories/route.ts
// /api/admin/attributes/route.ts
// /api/admin/analytics/route.ts
// /api/admin/system/route.ts
// /api/admin/taxonomy/route.ts
```

### RBAC Implementation
```typescript
// Check user role in profiles table with proper error handling
try {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Admin middleware profile lookup error:', error);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Only allow admin role access
  if (profile?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }
} catch (error) {
  console.error('Admin middleware RBAC error:', error);
  return new NextResponse('Forbidden', { status: 403 });
}
```

### Stricter Rate Limiting
```typescript
// Admin routes have stricter rate limiting using predefined config
const { success } = await rateLimit(identifier, RATE_LIMIT_CONFIGS.strict);

if (!success) {
  return new NextResponse('Too Many Requests', { status: 429 });
}
```

### Admin Context Passing
```typescript
// Pass both user ID and admin role to route handlers
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-user-id', user.id);
requestHeaders.set('x-user-role', 'admin');

return NextResponse.next({
  request: {
    headers: requestHeaders,
  },
});
```

### Comprehensive Error Handling
```typescript
// Handle all potential errors gracefully
try {
  // Rate limiting
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier, RATE_LIMIT_CONFIGS.strict);
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Admin role check
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (error || profile?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Add admin context
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', 'admin');
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
} catch (error) {
  console.error('Admin middleware error:', error);
  return new NextResponse('Internal Server Error', { status: 500 });
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `src/app/api/admin/middleware.ts` created with proper Supabase SSR client
- [ ] Proper matcher configuration for admin routes
- [ ] RBAC implementation working with error handling
- [ ] Stricter rate limiting configured using core utilities

### Code Quality Verification
- [ ] Middleware validates authentication properly with SSR client
- [ ] RBAC checks admin role correctly with proper error handling
- [ ] Rate limiting is stricter than app routes using predefined config
- [ ] Admin context passed through headers correctly
- [ ] Proper error responses for unauthorized/forbidden requests
- [ ] TypeScript types correctly defined
- [ ] Coordinates properly with global middleware
- [ ] Uses core rate limiting utilities

### Functionality Verification
- [ ] Admin routes require authentication
- [ ] Only admin role can access admin routes
- [ ] Non-admin users get 403 Forbidden
- [ ] Stricter rate limiting prevents abuse
- [ ] Admin role available in route handlers
- [ ] Unauthorized requests return 401
- [ ] Forbidden requests return 403
- [ ] Rate limited requests return 429
- [ ] No conflicts with global middleware
- [ ] Error handling works gracefully
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ Admin route group middleware implemented with SSR client
- ✅ Role-based access control working with proper error handling
- ✅ Stricter rate limiting for admin routes using core utilities
- ✅ Admin context passed to route handlers
- ✅ Proper matcher configuration for admin routes
- ✅ Unauthorized and forbidden access blocked
- ✅ Coordination with global middleware working
- ✅ Comprehensive error handling implemented
- ✅ `task validate` passes without errors

---

*Phase 8d implements advanced protection for the admin route group, ensuring only authenticated admin users can access administrative API routes with stricter rate limiting while coordinating with the global middleware layer.*
