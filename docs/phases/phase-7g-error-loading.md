# Phase 7g: Error and Loading Boundaries

## 🎯 Objective
Create comprehensive error and loading boundaries for all converted pages, ensuring proper user experience during server-side rendering and error states.

---

## 📋 Target Files (30+ files)

### Error Boundaries (15+ files)
Create `error.tsx` files for each major page section:

### 1. Public Section Error Boundaries
- [ ] `src/app/(public)/error.tsx` - Homepage errors
- [ ] `src/app/(public)/about/error.tsx` - About page errors
- [ ] `src/app/(public)/terms/error.tsx` - Terms page errors
- [ ] `src/app/(public)/privacy/error.tsx` - Privacy page errors

### 2. Auth Section Error Boundaries
- [ ] `src/app/(auth)/error.tsx` - Auth section general errors
- [ ] `src/app/(auth)/login/login/error.tsx` - Login errors
- [ ] `src/app/(auth)/register/register/error.tsx` - Register errors
- [ ] `src/app/(auth)/profile-setup/profile-setup/error.tsx` - Profile setup errors

### 3. App Section Error Boundaries
- [ ] `src/app/(app)/error.tsx` - App section general errors
- [ ] `src/app/(app)/dashboard/dashboard/error.tsx` - Dashboard errors
- [ ] `src/app/(app)/tools/tools/error.tsx` - Tools list errors
- [ ] `src/app/(app)/tools/tools/add/error.tsx` - Add tool errors
- [ ] `src/app/(app)/tools/tools/browse/error.tsx` - Browse tools errors
- [ ] `src/app/(app)/tools/tools/[id]/error.tsx` - Tool details errors
- [ ] `src/app/(app)/loans/loans/error.tsx` - Loans page errors
- [ ] `src/app/(app)/social/social/error.tsx` - Social feed errors
- [ ] `src/app/(app)/social/social/messages/[userId]/error.tsx` - Messages errors
- [ ] `src/app/(app)/social/social/profile/[userId]/error.tsx` - Profile errors

### 4. Admin Section Error Boundaries
- [ ] `src/app/admin/error.tsx` - Admin section general errors
- [ ] `src/app/admin/users/error.tsx` - User management errors
- [ ] `src/app/admin/categories/error.tsx` - Category management errors
- [ ] `src/app/admin/categories/external/error.tsx` - External categories errors
- [ ] `src/app/admin/attributes/error.tsx` - Attribute management errors
- [ ] `src/app/admin/roles/error.tsx` - Role management errors

### Loading States (15+ files)
Create `loading.tsx` files for each major page section:

### 1. Public Section Loading States
- [ ] `src/app/(public)/loading.tsx` - Homepage loading
- [ ] `src/app/(public)/about/loading.tsx` - About page loading
- [ ] `src/app/(public)/terms/loading.tsx` - Terms page loading
- [ ] `src/app/(public)/privacy/loading.tsx` - Privacy page loading

### 2. Auth Section Loading States
- [ ] `src/app/(auth)/loading.tsx` - Auth section general loading
- [ ] `src/app/(auth)/login/login/loading.tsx` - Login loading
- [ ] `src/app/(auth)/register/register/loading.tsx` - Register loading
- [ ] `src/app/(auth)/profile-setup/profile-setup/loading.tsx` - Profile setup loading

### 3. App Section Loading States
- [ ] `src/app/(app)/loading.tsx` - App section general loading
- [ ] `src/app/(app)/dashboard/dashboard/loading.tsx` - Dashboard loading
- [ ] `src/app/(app)/tools/tools/loading.tsx` - Tools list loading
- [ ] `src/app/(app)/tools/tools/add/loading.tsx` - Add tool loading
- [ ] `src/app/(app)/tools/tools/browse/loading.tsx` - Browse tools loading
- [ ] `src/app/(app)/tools/tools/[id]/loading.tsx` - Tool details loading
- [ ] `src/app/(app)/loans/loans/loading.tsx` - Loans page loading
- [ ] `src/app/(app)/social/social/loading.tsx` - Social feed loading
- [ ] `src/app/(app)/social/social/messages/[userId]/loading.tsx` - Messages loading
- [ ] `src/app/(app)/social/social/profile/[userId]/loading.tsx` - Profile loading

### 4. Admin Section Loading States
- [ ] `src/app/admin/loading.tsx` - Admin section general loading
- [ ] `src/app/admin/users/loading.tsx` - User management loading
- [ ] `src/app/admin/categories/loading.tsx` - Category management loading
- [ ] `src/app/admin/categories/external/loading.tsx` - External categories loading
- [ ] `src/app/admin/attributes/loading.tsx` - Attribute management loading
- [ ] `src/app/admin/roles/loading.tsx` - Role management loading

---

## 🚀 Implementation Details

### Error Boundary Templates

```typescript
// src/app/(public)/error.tsx - Homepage Error
'use client';

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-4">
          We're having trouble loading the homepage. Please try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          
          <a
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go to homepage
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

```typescript
// src/app/(app)/tools/tools/error.tsx - Tools Error
'use client';

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load your tools
        </h2>
        
        <p className="text-gray-600 mb-4">
          There was a problem loading your tools. This could be a temporary issue.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          
          <a
            href="/tools/add"
            className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Add a new tool instead
          </a>
          
          <a
            href="/dashboard"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/app/admin/error.tsx - Admin Error
'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isAuthError = error.message.includes('Unauthorized') || error.message.includes('Insufficient permissions');
  
  if (isAuthError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin area.
          </p>
          
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Admin Panel Error
        </h2>
        
        <p className="text-gray-600 mb-4">
          There was a problem loading the admin panel.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          
          <a
            href="/dashboard"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Loading State Templates

```typescript
// src/app/(public)/loading.tsx - Homepage Loading
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        
        {/* Featured tools skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/app/(app)/tools/tools/loading.tsx - Tools Loading
export default function ToolsLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        
        {/* Tools grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/app/admin/loading.tsx - Admin Loading
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Admin content skeleton */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Dynamic Route Loading States

```typescript
// src/app/(app)/tools/tools/[id]/loading.tsx - Tool Details Loading
export default function ToolDetailsLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Details skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
        
        {/* Related tools skeleton */}
        <div className="mt-12">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Verification Checklist

### Error Boundary Verification
- [ ] All public section error boundaries created
- [ ] All auth section error boundaries created
- [ ] All app section error boundaries created
- [ ] All admin section error boundaries created
- [ ] Error boundaries handle auth errors appropriately
- [ ] Error boundaries provide helpful user actions
- [ ] Development error details included

### Loading State Verification
- [ ] All public section loading states created
- [ ] All auth section loading states created
- [ ] All app section loading states created
- [ ] All admin section loading states created
- [ ] Loading states match page layout structure
- [ ] Skeleton components provide good UX
- [ ] Loading states are performant

### UI/UX Verification
- [ ] Error messages are user-friendly
- [ ] Loading states provide visual feedback
- [ ] Error boundaries offer recovery actions
- [ ] Consistent styling across all boundaries
- [ ] Accessible error and loading states
- [ ] Mobile-responsive error and loading UI

### Functionality Verification
- [ ] Error boundaries catch server function errors
- [ ] Loading states display during navigation
- [ ] Reset functionality works in error boundaries
- [ ] Navigation links work from error states
- [ ] Auth errors redirect appropriately
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 30+ error and loading boundary files created
- ✅ Comprehensive error handling for all page sections
- ✅ User-friendly error messages and recovery actions
- ✅ Proper loading states for server-side rendering
- ✅ Consistent UI/UX across all boundaries
- ✅ Auth errors handled appropriately
- ✅ Development error details for debugging
- ✅ All boundaries tested and working correctly
- ✅ `task validate` passes without errors

---

*Phase 7g ensures robust error handling and loading states, providing a polished user experience during server-side rendering and error conditions.*
