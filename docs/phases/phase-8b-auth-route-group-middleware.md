# Phase 8b: Auth Route Group Middleware

## 🎯 Objective
Implement middleware for the `(auth)` route group to handle authentication flows, session management, and redirects for login/register routes while coordinating with the global middleware.

---

## 📋 Target Files (1 file)

### 1. `src/app/api/(auth)/middleware.ts` - Auth Route Group Middleware
**Current State:** No middleware protection on auth routes
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Create middleware for `(auth)` route group
- [ ] Implement Supabase session management using SSR client
- [ ] Add redirect logic for authenticated users
- [ ] Handle login, register, and profile-setup routes
- [ ] Coordinate with global middleware for session management
- [ ] Add proper matcher configuration
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Auth Route Group Middleware Template
```typescript
// src/app/api/(auth)/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
  
  // Auth routes - redirect if already authenticated
  // Global middleware already handles session refresh, so we just check current state
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/api/(auth)/:path*']
};
```

### Route Group Structure
```typescript
// Routes covered by this middleware:
// /api/(auth)/login/route.ts
// /api/(auth)/register/route.ts
// /api/(auth)/auth/route.ts
// /api/(auth)/profile-setup/route.ts
```

### Session Management Coordination
```typescript
// Coordinate with global middleware for session management
// Global middleware handles session refresh and cookie management
// Auth middleware focuses on redirecting authenticated users

const { data: { user } } = await supabase.auth.getUser();

// Redirect authenticated users away from auth routes
if (user) {
  const redirectUrl = new URL('/dashboard', request.url);
  return NextResponse.redirect(redirectUrl);
}
```

### Error Handling
```typescript
// Handle potential errors gracefully
try {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return res;
} catch (error) {
  // If there's an error checking user, allow the request to proceed
  // The auth API routes will handle authentication properly
  console.error('Auth middleware error:', error);
  return res;
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `src/app/api/(auth)/middleware.ts` created with proper Supabase SSR client
- [ ] Proper matcher configuration for auth routes
- [ ] Supabase session management integration working
- [ ] Session refresh coordination with global middleware

### Code Quality Verification
- [ ] Middleware handles session management properly with SSR client
- [ ] Redirect logic works for authenticated users
- [ ] Proper error handling for auth failures
- [ ] TypeScript types correctly defined
- [ ] Matcher configuration covers all auth routes
- [ ] Coordinates properly with global middleware

### Functionality Verification
- [ ] Auth routes redirect authenticated users to dashboard
- [ ] Session management works correctly with SSR client
- [ ] Unauthenticated users can access auth routes
- [ ] Middleware runs on all auth route group paths
- [ ] No conflicts with global middleware
- [ ] Error handling works gracefully
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ Auth route group middleware implemented with SSR client
- ✅ Session management and validation working
- ✅ Authenticated users redirected from auth routes
- ✅ Proper matcher configuration for auth routes
- ✅ Supabase SSR integration working correctly
- ✅ Coordination with global middleware working
- ✅ Error handling implemented gracefully
- ✅ `task validate` passes without errors

---

*Phase 8b implements authentication flow protection for the auth route group, ensuring proper session management and redirects while coordinating with the global middleware layer.*
