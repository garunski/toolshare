# Phase 8: Implement Middleware and Route Protection

## 🎯 Objective
Implement per-route-group middleware with authentication, authorization, rate limiting, and error handling to protect all API routes.

## 📊 Current State Analysis

### Problem
- **No middleware protection** on API routes that accept user input
- **Missing authentication validation** on protected endpoints
- **No role-based access control (RBAC)** for admin routes
- **No rate limiting** to prevent abuse
- **No request logging** for debugging and monitoring
- **No centralized error handling** for API routes

### Impact
- **Security vulnerabilities** from unprotected endpoints
- **Unauthorized access** to sensitive operations
- **Potential abuse** without rate limiting
- **Difficult debugging** without proper logging
- **Inconsistent error responses** across API endpoints

## 🚀 Step-by-Step Implementation

### Step 1: Create Middleware Structure
Create middleware files for each route group:

```typescript
// src/app/api/(auth)/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Refresh session if needed
  await supabase.auth.getSession();
  
  // Auth routes - redirect if already authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
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
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Rate limiting
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier);
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Add user context to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.user.id);
  
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
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Rate limiting (stricter for admin routes)
  const identifier = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(identifier, { max: 10, window: '1 m' });
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Authentication check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Admin role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (profile?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Add admin context to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.user.id);
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

### Step 2: Create Rate Limiting Utility
Create a rate limiting utility for middleware:

```typescript
// src/lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function rateLimit(
  identifier: string,
  options: { max?: number; window?: string } = {}
) {
  const { max = 100, window = '1 m' } = options;
  const key = `rate-limit:${identifier}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  if (current > max) {
    return { success: false, current, max };
  }
  
  return { success: true, current, max };
}
```

### Step 3: Create Error Handling Middleware
Create centralized error handling:

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

### Step 4: Update API Routes to Use Error Handling
Update existing API routes to use the error handler:

```typescript
// src/app/api/(app)/tools/create/route.ts
import { NextRequest } from 'next/server';
import { handleApiError, ApiError } from '@/lib/api-error-handler';
import { validateTool } from './validateTool';
import { performTool } from './performTool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const validatedData = validateTool(body);
    
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }
    
    // Business logic
    const result = await performTool(validatedData, userId);
    
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 5: Create Request Logging Middleware
Add request logging for debugging:

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

### Step 6: Update Global Middleware
Update the global middleware to work with API route groups:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { pathname } = request.nextUrl;
  
  // Refresh session if needed
  await supabase.auth.getSession();
  
  // Skip API routes (handled by route-specific middleware)
  if (pathname.startsWith('/api/')) {
    return res;
  }
  
  // Public routes - no protection needed
  if (pathname === '/' || 
      pathname.startsWith('/terms') || 
      pathname.startsWith('/privacy') || 
      pathname.startsWith('/about')) {
    return res;
  }
  
  // Auth routes - redirect if already authenticated
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/profile-setup')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return res;
  }
  
  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return res;
  }
  
  // App routes - require authentication
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/tools') || 
      pathname.startsWith('/loans') || 
      pathname.startsWith('/social')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return res;
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## ✅ Verification Checklist

- [ ] Middleware created for each route group (`(auth)`, `(app)`, `admin`)
- [ ] Authentication validation working on protected routes
- [ ] Role-based access control implemented for admin routes
- [ ] Rate limiting configured with appropriate limits
- [ ] Error handling middleware implemented and tested
- [ ] Request logging working for debugging
- [ ] Global middleware updated to skip API routes
- [ ] All API routes updated to use error handling
- [ ] User context properly passed through middleware headers
- [ ] Rate limiting tested with different user scenarios

## 🎯 Success Criteria

- ✅ All API routes have mandatory middleware protection
- ✅ Authentication validation working on all protected endpoints
- ✅ Role-based access control implemented for admin routes
- ✅ Rate limiting prevents abuse on all API routes
- ✅ Centralized error handling provides consistent responses
- ✅ Request logging enables debugging and monitoring
- ✅ User context properly available in API route handlers

## ⚠️ Common Issues and Solutions

### Issue: Middleware not running on API routes
**Solution:** Ensure `matcher` configuration is correct and includes the proper path patterns.

### Issue: Rate limiting too strict/lenient
**Solution:** Adjust rate limits based on route sensitivity and user behavior patterns.

### Issue: Error responses not consistent
**Solution:** Use the centralized `handleApiError` function in all API routes.

### Issue: User context not available in routes
**Solution:** Ensure middleware sets headers and routes read from `request.headers`.

## 📚 Additional Resources

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Rate Limiting Best Practices](https://upstash.com/docs/redis/howto/ratelimit)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
