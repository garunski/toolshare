# Phase 8c: App Route Group Middleware

## 🎯 Objective
Implement middleware for the `(app)` route group to handle authentication validation, rate limiting, and user context for all application API routes while coordinating with the global middleware.

---

## 📋 Target Files (1 file)

### 1. `src/app/api/(app)/middleware.ts` - App Route Group Middleware
**Current State:** No middleware protection on app routes
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Create middleware for `(app)` route group
- [ ] Implement authentication validation with SSR client
- [ ] Add rate limiting with standard limits using core utilities
- [ ] Pass user context through headers
- [ ] Coordinate with global middleware for session management
- [ ] Add proper matcher configuration
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### App Route Group Middleware Template
```typescript
// src/app/api/(app)/middleware.ts
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
  
  // Rate limiting using standard configuration
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier, RATE_LIMIT_CONFIGS.standard);
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check (global middleware already validated, but double-check)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Add user context to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/(app)/:path*']
};
```

### Route Group Structure
```typescript
// Routes covered by this middleware:
// /api/(app)/tools/route.ts
// /api/(app)/tools/create/route.ts
// /api/(app)/tools/[id]/route.ts
// /api/(app)/loans/route.ts
// /api/(app)/profiles/route.ts
// /api/(app)/social/route.ts
// /api/(app)/search/route.ts
```

### Rate Limiting Configuration
```typescript
// Use predefined standard rate limiting for app routes
const { success } = await rateLimit(identifier, RATE_LIMIT_CONFIGS.standard);

if (!success) {
  return new NextResponse('Too Many Requests', { status: 429 });
}
```

### User Context Passing
```typescript
// Pass user ID to route handlers for business logic
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-user-id', user.id);

return NextResponse.next({
  request: {
    headers: requestHeaders,
  },
});
```

### Error Handling
```typescript
// Handle potential errors gracefully
try {
  // Rate limiting
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier, RATE_LIMIT_CONFIGS.standard);
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Add user context
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
} catch (error) {
  console.error('App middleware error:', error);
  return new NextResponse('Internal Server Error', { status: 500 });
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `src/app/api/(app)/middleware.ts` created with proper Supabase SSR client
- [ ] Proper matcher configuration for app routes
- [ ] Rate limiting integration using core utilities
- [ ] Authentication validation implemented

### Code Quality Verification
- [ ] Middleware validates authentication properly with SSR client
- [ ] Rate limiting prevents abuse using predefined configurations
- [ ] User context passed through headers correctly
- [ ] Proper error responses for unauthorized requests
- [ ] TypeScript types correctly defined
- [ ] Coordinates properly with global middleware
- [ ] Uses core rate limiting utilities

### Functionality Verification
- [ ] App routes require authentication
- [ ] Rate limiting works with different IPs using standard config
- [ ] User ID available in route handlers
- [ ] Unauthorized requests return 401
- [ ] Rate limited requests return 429
- [ ] No conflicts with global middleware
- [ ] Error handling works gracefully
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ App route group middleware implemented with SSR client
- ✅ Authentication validation working with global middleware coordination
- ✅ Rate limiting prevents abuse using core utilities
- ✅ User context passed to route handlers
- ✅ Proper matcher configuration for app routes
- ✅ Unauthorized access blocked
- ✅ Coordination with global middleware working
- ✅ Error handling implemented gracefully
- ✅ `task validate` passes without errors

---

*Phase 8c implements protection for the app route group, ensuring all application API routes require authentication and have rate limiting while coordinating with the global middleware layer.*
