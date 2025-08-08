# Phase 8e: Update Global Middleware

## 🎯 Objective
Update the existing global middleware to work with the new route group middleware structure, ensuring proper coordination between global and route-specific middleware without conflicts.

---

## 📋 Target Files (1 file)

### 1. `middleware.ts` - Global Middleware Update
**Current State:** Global middleware handles all routes including API routes
**Complexity:** ⭐⭐ Medium

**Sub-tasks:**
- [ ] Update global middleware to coordinate with route group middleware
- [ ] Maintain existing page-level protection and session management
- [ ] Ensure proper API route handling coordination
- [ ] Add proper error handling and logging
- [ ] Test coordination with route group middleware
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Global Middleware Coordination Strategy
The global middleware will continue to handle session management and page-level protection, while route group middleware handles API-specific features like rate limiting and RBAC.

### Updated Global Middleware Template
```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  try {
    // Try to get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If there's an error getting the user, try to refresh the session
    if (userError) {
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      // If refresh also fails, clear the session and continue
      if (refreshError) {
        // Clear invalid session cookies
        supabaseResponse.cookies.delete("sb-access-token");
        supabaseResponse.cookies.delete("sb-refresh-token");
        return supabaseResponse;
      }

      // If refresh succeeds, update the response with new session
      if (session) {
        return supabaseResponse;
      }
    }

    // Route protection logic
    // Public routes - no protection needed
    if (
      pathname === "/" ||
      pathname.startsWith("/terms") ||
      pathname.startsWith("/privacy") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/api/(public)")
    ) {
      return supabaseResponse;
    }

    // Auth routes - redirect if already authenticated
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/profile-setup") ||
      pathname.startsWith("/api/(auth)")
    ) {
      if (user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    // Admin routes - require admin role (page-level protection)
    if (pathname.startsWith("/admin")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check admin role for page access
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    // App routes - require authentication (page-level protection)
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/tools") ||
      pathname.startsWith("/loans") ||
      pathname.startsWith("/social")
    ) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return supabaseResponse;
    }

    // API routes - let route group middleware handle them
    // Global middleware provides basic session management and cookie handling
    if (pathname.startsWith("/api/")) {
      return supabaseResponse;
    }

    return supabaseResponse;
  } catch (error) {
    // If any unexpected error occurs, clear session and continue
    console.error('Global middleware error:', error);
    supabaseResponse.cookies.delete("sb-access-token");
    supabaseResponse.cookies.delete("sb-refresh-token");
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### API Route Coordination
```typescript
// API routes - let route group middleware handle them
// Global middleware provides basic session management and cookie handling
if (pathname.startsWith("/api/")) {
  return supabaseResponse;
}
```

### Route Group Coordination
```typescript
// Auth routes - redirect if already authenticated
// Route group middleware will handle API-specific auth logic
if (
  pathname.startsWith("/login") ||
  pathname.startsWith("/register") ||
  pathname.startsWith("/profile-setup") ||
  pathname.startsWith("/api/(auth)")
) {
  if (user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return supabaseResponse;
}
```

### Admin Route Protection
```typescript
// Admin routes - require admin role (page-level protection)
// Route group middleware will handle API-specific RBAC
if (pathname.startsWith("/admin")) {
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin role for page access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return supabaseResponse;
}
```

### Error Handling and Logging
```typescript
// Enhanced error handling with logging
try {
  // ... middleware logic
} catch (error) {
  // If any unexpected error occurs, clear session and continue
  console.error('Global middleware error:', error);
  supabaseResponse.cookies.delete("sb-access-token");
  supabaseResponse.cookies.delete("sb-refresh-token");
  return supabaseResponse;
}
```

---

## ✅ Verification Checklist

### File Update Verification
- [ ] Global middleware updated to coordinate with route group middleware
- [ ] Proper coordination with route group middleware
- [ ] Existing page-level protection maintained
- [ ] Matcher configuration updated
- [ ] Error handling and logging improved

### Code Quality Verification
- [ ] API routes properly coordinated with route group middleware
- [ ] Page-level authentication working correctly
- [ ] Admin route protection maintained
- [ ] Auth route redirects working
- [ ] TypeScript types correctly defined
- [ ] Error handling works gracefully
- [ ] Session management working properly

### Functionality Verification
- [ ] API routes handled by route group middleware
- [ ] Page-level authentication still works
- [ ] Admin pages require admin role
- [ ] Auth pages redirect authenticated users
- [ ] Public pages accessible without auth
- [ ] No conflicts between global and route group middleware
- [ ] Session management working correctly
- [ ] Error handling works gracefully
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ Global middleware updated to coordinate with route group middleware
- ✅ Route group middleware handles API protection
- ✅ Page-level authentication maintained
- ✅ Admin route protection working
- ✅ Auth route redirects working
- ✅ Proper coordination between middleware layers
- ✅ Error handling and logging improved
- ✅ Session management working correctly
- ✅ `task validate` passes without errors

---

*Phase 8e updates the global middleware to work with the new route group middleware structure, ensuring proper separation of concerns between page-level and API-level protection while maintaining coordination.*
