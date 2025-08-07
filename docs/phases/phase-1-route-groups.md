# Phase 1: Organize Application Sections with Route Groups

## 🎯 Objective
Reorganize the application structure using Next.js route groups with parentheses to create clear separation between public, auth, admin, and authenticated app sections.

---

## 🚨 Current State Analysis

**Problem:** No proper sectioning of the application with clear boundaries
```
src/app/
├── page.tsx (landing page mixed with other pages)
├── auth/ (authentication pages not properly grouped)
├── admin/ (admin pages not protected by route group)
├── tools/ (app pages mixed with other sections)
├── dashboard/ (app pages mixed with other sections)
├── loans/ (app pages mixed with other sections)
├── social/ (app pages mixed with other sections)
└── api/ (API routes not organized by section)
```

**Impact:**
- No clear separation between public, auth, admin, and app sections
- Difficult to understand application structure
- No proper route protection boundaries
- API routes not organized by section
- Violates Next.js App Router best practices

---

## 🚀 Step-by-Step Implementation

### Step 1: Create Route Group Directories

**Create the new route group structure:**

```bash
# Create the new route group structure
mkdir -p src/app/\(public\)
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/\(auth\)/profile-setup

mkdir -p src/app/\(app\)/dashboard
mkdir -p src/app/\(app\)/tools
mkdir -p src/app/\(app\)/loans
mkdir -p src/app/\(app\)/social

# Create API route groups
mkdir -p src/app/api/\(public\)/health
mkdir -p src/app/api/\(auth\)/login
mkdir -p src/app/api/\(auth\)/register
mkdir -p src/app/api/admin/users
mkdir -p src/app/api/admin/categories
mkdir -p src/app/api/admin/attributes
mkdir -p src/app/api/\(app\)/tools
mkdir -p src/app/api/\(app\)/loans
mkdir -p src/app/api/\(app\)/social
```

### Step 2: Move Public Pages

**Current:** `src/app/page.tsx` (landing page)
**Target:** `src/app/(public)/page.tsx`

```bash
# Move landing page
mv src/app/page.tsx src/app/\(public\)/page.tsx

# Create additional public pages
touch src/app/\(public\)/terms/page.tsx
touch src/app/\(public\)/privacy/page.tsx
touch src/app/\(public\)/about/page.tsx
```

**Create basic public pages:**

```typescript
// src/app/(public)/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose">
        <p>Terms of service content goes here...</p>
      </div>
    </div>
  );
}
```

```typescript
// src/app/(public)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose">
        <p>Privacy policy content goes here...</p>
      </div>
    </div>
  );
}
```

```typescript
// src/app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">About ToolShare</h1>
      <div className="prose">
        <p>About page content goes here...</p>
      </div>
    </div>
  );
}
```

### Step 3: Move Authentication Pages

**Current:** `src/app/auth/`
**Target:** `src/app/(auth)/`

```bash
# Move auth pages
mv src/app/auth/login src/app/\(auth\)/login
mv src/app/auth/register src/app/\(auth\)/register
mv src/app/auth/profile-setup src/app/\(auth\)/profile-setup

# Remove old auth directory
rmdir src/app/auth
```

**Note:** Admin pages will keep their existing layout and protection in `src/app/admin/layout.tsx`

### Step 4: Move App Pages

**Current:** `src/app/tools/`, `src/app/dashboard/`, `src/app/loans/`, `src/app/social/`
**Target:** `src/app/(app)/`

```bash
# Move app pages
mv src/app/tools src/app/\(app\)/tools
mv src/app/dashboard src/app/\(app\)/dashboard
mv src/app/loans src/app/\(app\)/loans
mv src/app/social src/app/\(app\)/social
```

### Step 5: Create Layout Files

**Create app layout with authentication protection:**

```typescript
// src/app/(app)/layout.tsx
import { AuthProtection } from '@/common/components/AuthProtection';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProtection>
      <div className="app-layout">
        {children}
      </div>
    </AuthProtection>
  );
}
```

**Create auth layout:**

```typescript
// src/app/(auth)/layout.tsx
import { AuthRedirect } from '@/common/components/AuthRedirect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirect>
      <div className="auth-layout">
        {children}
      </div>
    </AuthRedirect>
  );
}
```

### Step 6: Move API Routes

**Move existing API routes to their appropriate groups:**

```bash
# Move existing API routes to their appropriate groups
mv src/app/api/tools/* src/app/api/\(app\)/tools/
mv src/app/api/loans/* src/app/api/\(app\)/loans/
mv src/app/api/social/* src/app/api/\(app\)/social/
mv src/app/api/profiles/* src/app/api/\(app\)/profiles/

# Admin API routes stay in their current location
# No changes needed for admin API routes
```

**Create health check API:**

```typescript
// src/app/api/(public)/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
```

### Step 7: Update Navigation Components

**Update AppHeader component to use new route structure:**

```typescript
// src/app/(app)/components/AppHeader.tsx
const navigation = {
  public: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
  ],
  auth: [
    { name: 'Login', href: '/login' },
    { name: 'Register', href: '/register' },
  ],
  app: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tools', href: '/tools' },
    { name: 'Loans', href: '/loans' },
    { name: 'Social', href: '/social' },
  ],
  admin: [
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Attributes', href: '/admin/attributes' },
  ],
};
```

### Step 8: Update Middleware

**Update middleware.ts to handle new route structure:**

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
    
    // Check admin role
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Step 9: Update TypeScript Path Aliases

**Update tsconfig.json to add new path aliases:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/public/*": ["./src/app/(public)/*"],
      "@/auth/*": ["./src/app/(auth)/*"],
      "@/admin/*": ["./src/app/admin/*"],
      "@/app/*": ["./src/app/(app)/*"],
      "@/apiPublic/*": ["./src/app/api/(public)/*"],
      "@/apiAuth/*": ["./src/app/api/(auth)/*"],
      "@/apiAdmin/*": ["./src/app/api/admin/*"],
      "@/apiApp/*": ["./src/app/api/(app)/*"],
      "@/supabase/*": ["./src/common/supabase/*"],
      "@/primitives/*": ["./src/primitives/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Step 10: Update Import Paths

**Update all import paths to use new structure:**

```bash
# Update imports in all TypeScript/JavaScript files to use new aliases
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/auth/|@/auth/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/admin/|@/admin/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/tools/|@/app/tools/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/dashboard/|@/app/dashboard/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/loans/|@/app/loans/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/social/|@/app/social/|g'

# Update API imports to use single-word aliases
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/api/tools/|@/apiApp/tools/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/api/admin/|@/apiAdmin/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/api/auth/|@/apiAuth/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/api/loans/|@/apiApp/loans/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/api/social/|@/apiApp/social/|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/app/api/profiles/|@/apiApp/profiles/|g'
```

---

## 📋 Verification Checklist

### ✅ Route Group Structure Verification

- [ ] All pages organized into proper route groups
- [ ] Public pages in `src/app/(public)/`
- [ ] Auth pages in `src/app/(auth)/`
- [ ] Admin pages in `src/app/admin/`
- [ ] App pages in `src/app/(app)/`
- [ ] API routes organized by section

### ✅ Navigation Verification

- [ ] Navigation works correctly between all sections
- [ ] Links point to correct routes
- [ ] No broken navigation links
- [ ] Proper route protection in place

### ✅ Authentication Verification

- [ ] Authentication and authorization work properly
- [ ] Public routes accessible without auth
- [ ] Auth routes redirect if already authenticated
- [ ] App routes require authentication
- [ ] Admin routes require admin role

### ✅ Functionality Verification

- [ ] Run `task validate` to ensure application builds and runs without errors
- [ ] All existing functionality preserved
- [ ] Middleware correctly handles route protection
- [ ] Import paths updated correctly

---

## 🎯 Success Criteria

- ✅ All pages organized into proper route groups
- ✅ Navigation works correctly between all sections
- ✅ Authentication and authorization work properly
- ✅ API routes organized by section
- ✅ Run `task validate` to ensure application builds and runs without errors
- ✅ All existing functionality preserved
- ✅ Middleware correctly handles route protection

---

## 🚨 Common Issues and Solutions

### Issue: Import Path Errors
**Problem:** Import paths break after moving files
**Solution:**
- Use IDE refactoring tools to update imports
- Run TypeScript compiler to catch missing imports
- Use search and replace for common import patterns

### Issue: Route Protection
**Problem:** Middleware not protecting routes correctly
**Solution:**
- Test each route group individually
- Check middleware matcher configuration
- Verify authentication state handling

### Issue: Navigation Links
**Problem:** Navigation links point to old routes
**Solution:**
- Update all navigation components
- Test navigation flow end-to-end
- Check for hardcoded route references

---

## 📚 Additional Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

*Phase 1 establishes the foundation for the rest of the refactoring by creating a clear, organized structure that separates concerns and makes the codebase more maintainable.*
