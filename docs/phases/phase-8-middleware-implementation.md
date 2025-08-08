# Phase 8: Implement Middleware and Route Protection

## 🎯 Objective
Implement per-route-group middleware with authentication, authorization, rate limiting, and error handling to protect all API routes while maintaining proper coordination with existing global middleware.

## 📊 Current State Analysis

### Problem
- **Global middleware handles API routes** - Current middleware already protects API routes but lacks granular control
- **Missing rate limiting** on API routes despite basic authentication
- **No role-based access control (RBAC)** for admin routes
- **No centralized error handling** for API routes
- **No request logging** for debugging and monitoring
- **Inconsistent error responses** across API endpoints

### Impact
- **Limited security granularity** - Global middleware provides basic protection but lacks route-specific features
- **No rate limiting** to prevent abuse
- **Difficult debugging** without proper logging
- **Inconsistent error responses** across API endpoints
- **Missing RBAC** for sensitive admin operations

## 🚀 Implementation Strategy

### **Two-Layer Middleware Architecture**

Instead of replacing the global middleware, we'll implement a **coordinated two-layer approach**:

1. **Global Middleware** (existing) - Handles page-level protection and session management
2. **Route Group Middleware** (new) - Handles API-specific protection with rate limiting and RBAC

### **Coordination Strategy**

```typescript
// Global middleware focuses on page protection
// Route group middleware focuses on API protection
// Both work together without conflicts
```

## 🚀 Step-by-Step Implementation

### Step 1: Create Core Middleware Infrastructure
Create foundational utilities that will be used by route group middleware:

```typescript
// src/lib/rate-limit.ts
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  identifier: string,
  options: { max?: number; window?: number } = {}
) {
  const { max = 100, window = 60000 } = options; // 1 minute default
  const now = Date.now();
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Check current rate
  const current = rateLimitStore.get(identifier);
  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + window });
    return { success: true, current: 1, max };
  }
  
  if (current.count >= max) {
    return { success: false, current: current.count, max };
  }
  
  current.count++;
  return { success: true, current: current.count, max };
}
```

```typescript
// src/lib/api-error-handler.ts
import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    {
      error: 'Unknown Error',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}
```

```typescript
// src/lib/request-logger.ts
import { NextRequest } from 'next/server';

export function logRequest(request: NextRequest, response: Response) {
  const { method, url } = request;
  const { status } = response;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.ip || 'unknown';
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} ${status} - ${ip} - ${userAgent}`);
}
```

### Step 2: Create Route Group Middleware
Create middleware for each route group that works with the existing global middleware:

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

```typescript
// src/app/api/(app)/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit } from '@/lib/rate-limit';

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
  
  // Rate limiting
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier);
  
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

```typescript
// src/app/api/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit } from '@/lib/rate-limit';

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
  const { success } = await rateLimit(identifier, { max: 10, window: 60000 });
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check (global middleware already validated, but double-check)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Admin role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
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

### Step 3: Update Global Middleware
Update the global middleware to work with route group middleware:

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

      // Check admin role
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
    // Global middleware provides basic session management
    if (pathname.startsWith("/api/")) {
      return supabaseResponse;
    }

    return supabaseResponse;
  } catch (error) {
    // If any unexpected error occurs, clear session and continue
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

## ✅ Verification Checklist

- [ ] Core middleware infrastructure created (rate limiting, error handling, logging)
- [ ] Route group middleware implemented for all groups (`(auth)`, `(app)`, `admin`)
- [ ] Global middleware updated to coordinate with route group middleware
- [ ] Authentication validation working on all protected routes
- [ ] Role-based access control implemented for admin routes
- [ ] Rate limiting configured with appropriate limits
- [ ] Error handling middleware implemented and tested
- [ ] Request logging working for debugging
- [ ] User context properly passed through middleware headers
- [ ] Rate limiting tested with different user scenarios
- [ ] Run `task validate` to ensure middleware works correctly

## 🎯 Success Criteria

- ✅ **Coordinated two-layer middleware** - Global and route-specific middleware work together
- ✅ **Authentication validation** working on all protected endpoints
- ✅ **Role-based access control** implemented for admin routes
- ✅ **Rate limiting** prevents abuse on all API routes
- ✅ **Centralized error handling** provides consistent responses
- ✅ **Request logging** enables debugging and monitoring
- ✅ **User context** properly available in API route handlers
- ✅ **No middleware conflicts** - Global and route-specific middleware coordinate properly
- ✅ Run `task validate` to ensure no breaking changes

## ⚠️ Common Issues and Solutions

### Issue: Middleware conflicts between global and route-specific
**Solution:** Global middleware handles session management and page protection, route-specific middleware handles API-specific features like rate limiting and RBAC.

### Issue: Rate limiting too strict/lenient
**Solution:** Adjust rate limits based on route sensitivity and user behavior patterns.

### Issue: Error responses not consistent
**Solution:** Use the centralized `handleApiError` function in all API routes.

### Issue: User context not available in routes
**Solution:** Ensure route group middleware sets headers and routes read from `request.headers`.

## 📚 Additional Resources

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Rate Limiting Best Practices](https://expressjs.com/en/advanced/best-practices-performance.html#use-gzip-compression)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
