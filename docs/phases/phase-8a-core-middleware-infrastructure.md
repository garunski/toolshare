# Phase 8a: Core Middleware Infrastructure

## 🎯 Objective
Create the foundational middleware utilities and error handling infrastructure that will be used across all API route groups.

---

## 📋 Target Files (3 files)

### 1. `src/lib/rate-limit.ts` - Rate Limiting Utility
**Current State:** Multiple fragmented rate limiting implementations
**Complexity:** ⭐ Low

**Sub-tasks:**
- [ ] Create rate limiting utility with in-memory storage
- [ ] Implement configurable limits and time windows
- [ ] Add identifier-based rate limiting (IP address)
- [ ] Create reusable function for different route types
- [ ] Add proper error handling and logging
- [ ] Run `task validate` and fix any issues

### 2. `src/lib/api-error-handler.ts` - Centralized Error Handling
**Current State:** No centralized error handling
**Complexity:** ⭐ Low

**Sub-tasks:**
- [ ] Create ApiError class with status codes and messages
- [ ] Implement handleApiError function for consistent responses
- [ ] Add proper error logging and debugging
- [ ] Create standardized error response format
- [ ] Add support for custom error codes
- [ ] Run `task validate` and fix any issues

### 3. `src/lib/request-logger.ts` - Request Logging Utility
**Current State:** No request logging implementation
**Complexity:** ⭐ Low

**Sub-tasks:**
- [ ] Create request logging function for debugging
- [ ] Log method, URL, status, IP, and user agent
- [ ] Add timestamp and structured logging
- [ ] Create reusable function for middleware
- [ ] Add optional debug mode for development
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Rate Limiting Utility Template
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

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  standard: { max: 100, window: 60000 }, // 100 requests per minute
  strict: { max: 10, window: 60000 },    // 10 requests per minute
  burst: { max: 50, window: 10000 },     // 50 requests per 10 seconds
} as const;
```

### Error Handling Template
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
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    {
      error: 'Unknown Error',
      code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

// Common error codes for consistency
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### Request Logging Template
```typescript
// src/lib/request-logger.ts
import { NextRequest } from 'next/server';

export interface RequestLogData {
  method: string;
  url: string;
  status: number;
  ip: string;
  userAgent: string;
  timestamp: string;
  duration?: number;
  userId?: string;
}

export function logRequest(request: NextRequest, response: Response, startTime?: number) {
  const { method, url } = request;
  const { status } = response;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.ip || 'unknown';
  const userId = request.headers.get('x-user-id') || undefined;
  const timestamp = new Date().toISOString();
  const duration = startTime ? Date.now() - startTime : undefined;
  
  const logData: RequestLogData = {
    method,
    url,
    status,
    ip,
    userAgent,
    timestamp,
    duration,
    userId,
  };
  
  // Structured logging for better debugging
  console.log(`[${timestamp}] ${method} ${url} ${status} - ${ip} - ${userAgent}${duration ? ` (${duration}ms)` : ''}${userId ? ` - User: ${userId}` : ''}`);
  
  // In development, log additional details
  if (process.env.NODE_ENV === 'development') {
    console.log('Request Details:', JSON.stringify(logData, null, 2));
  }
  
  return logData;
}

// Middleware wrapper for automatic logging
export function withRequestLogging(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const response = await handler(request);
    logRequest(request, response, startTime);
    return response;
  };
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `src/lib/rate-limit.ts` created with in-memory storage and configurable limits
- [ ] `src/lib/api-error-handler.ts` created with ApiError class and consistent response format
- [ ] `src/lib/request-logger.ts` created with structured logging and middleware wrapper
- [ ] All utilities properly exported and typed

### Code Quality Verification
- [ ] Rate limiting supports configurable limits and windows with predefined configs
- [ ] Error handling provides consistent response format with timestamps
- [ ] Request logging includes all necessary information and structured output
- [ ] All utilities have proper TypeScript types and interfaces
- [ ] Error handling includes proper logging and error codes
- [ ] Request logging includes middleware wrapper for easy integration

### Functionality Verification
- [ ] Rate limiting works with different identifiers and configurations
- [ ] Error handling returns proper HTTP status codes and consistent format
- [ ] Request logging captures all required fields and provides structured output
- [ ] All utilities are reusable across middleware and API routes
- [ ] Predefined rate limit configurations work correctly
- [ ] Error codes are consistent and well-defined
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 3 core middleware utilities created with production-ready features
- ✅ Rate limiting supports configurable limits with predefined configurations
- ✅ Centralized error handling with consistent format and error codes
- ✅ Request logging for debugging and monitoring with structured output
- ✅ All utilities properly typed and exported with TypeScript interfaces
- ✅ Reusable across all route group middleware and API routes
- ✅ Development-friendly logging with additional details
- ✅ Middleware wrapper for automatic request logging
- ✅ `task validate` passes without errors

---

*Phase 8a establishes the foundational infrastructure that will be used by all route group middleware implementations, providing robust rate limiting, error handling, and logging capabilities.*
