# Authentication Integration

## Enhance Existing Authentication System

### 1. Update Session State Handler
- [ ] Modify: `src/common/operations/sessionStateHandler.ts`
- [ ] Add role information to session state
- [ ] Include permission caching

```typescript
// Additions to existing sessionStateHandler.ts
import { RoleManagementOperations } from '@/operations/roleManagement';
import type { Role } from '@/types/roles';

// Add to SessionState interface
export interface SessionState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  roles?: Role[]; // Add roles
  permissions?: string[]; // Add cached permissions
}

// Add to SessionStateHandler class
export class SessionStateHandler {
  // ... existing code ...

  private async loadUserRoles(userId: string): Promise<Role[]> {
    try {
      return await RoleManagementOperations.getUserRoles(userId);
    } catch (error) {
      console.error('Failed to load user roles:', error);
      return [];
    }
  }

  private async loadUserPermissions(userId: string): Promise<string[]> {
    try {
      const roles = await this.loadUserRoles(userId);
      // Get all permissions for user's roles
      const rolesWithPermissions = await RoleManagementOperations.getAllRolesWithPermissions();
      const userRoleIds = roles.map(r => r.id);
      
      const permissions = rolesWithPermissions
        .filter(role => userRoleIds.includes(role.id))
        .flatMap(role => role.permissions.map(p => p.name));
      
      return [...new Set(permissions)]; // Remove duplicates
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      return [];
    }
  }

  // Update the initialize method to include roles and permissions
  private async updateSessionState(session: Session | null) {
    if (session?.user) {
      const roles = await this.loadUserRoles(session.user.id);
      const permissions = await this.loadUserPermissions(session.user.id);
      
      const newState: SessionState = {
        user: session.user,
        session,
        roles,
        permissions,
        loading: false,
        error: null,
      };
      
      this.setState(newState);
    } else {
      this.setState({
        user: null,
        session: null,
        roles: [],
        permissions: [],
        loading: false,
        error: null,
      });
    }
  }

  // Add method to refresh user roles
  async refreshUserRoles(): Promise<void> {
    if (this.currentState.user) {
      const roles = await this.loadUserRoles(this.currentState.user.id);
      const permissions = await this.loadUserPermissions(this.currentState.user.id);
      
      this.setState({
        ...this.currentState,
        roles,
        permissions,
      });
    }
  }
}
```

### 2. Update useAuth Hook
- [ ] Modify: `src/common/hooks/useAuth.ts`
- [ ] Add role and permission utilities
- [ ] Integrate with role management system

```typescript
// Updated useAuth.ts with role integration
import { useEffect, useState } from "react";
import { SessionState, SessionStateHandler } from "@/common/operations/sessionStateHandler";

export function useAuth() {
  const [authState, setAuthState] = useState<SessionState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    roles: [],
    permissions: [],
  });

  useEffect(() => {
    const sessionManager = SessionStateHandler.getInstance();
    const unsubscribe = sessionManager.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  const signOut = async () => {
    const sessionManager = SessionStateHandler.getInstance();
    await sessionManager.signOut();
  };

  const refreshSession = async () => {
    const sessionManager = SessionStateHandler.getInstance();
    await sessionManager.refreshSession();
  };

  const refreshRoles = async () => {
    const sessionManager = SessionStateHandler.getInstance();
    await sessionManager.refreshUserRoles();
  };

  // Role checking utilities
  const hasRole = (roleName: string): boolean => {
    return authState.roles?.some(role => role.name === roleName) ?? false;
  };

  const hasPermission = (permissionName: string): boolean => {
    return authState.permissions?.includes(permissionName) ?? false;
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  return {
    user: authState.user,
    session: authState.session,
    roles: authState.roles || [],
    permissions: authState.permissions || [],
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    
    // Role utilities
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    
    // Convenience role checks
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    isUser: hasRole('user'),
    
    // Actions
    signOut,
    refreshSession,
    refreshRoles,
  };
}
```

### 3. Role-Based Route Protection Hook
- [ ] Create: `src/common/hooks/useRouteProtection.ts` (under 150 lines)

```typescript
// src/common/hooks/useRouteProtection.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/common/hooks/useAuth';

interface RouteProtectionOptions {
  requiredRole?: string;
  requiredPermission?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAll?: boolean; // true = AND logic, false = OR logic (default)
  redirectTo?: string;
  allowAnonymous?: boolean;
}

export function useRouteProtection(options: RouteProtectionOptions = {}) {
  const { 
    user, 
    loading, 
    hasRole, 
    hasPermission, 
    hasAnyRole, 
    hasAllRoles,
    hasAnyPermission 
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (!options.allowAnonymous && !user) {
      const redirect = options.redirectTo || '/auth/login';
      const currentPath = window.location.pathname;
      router.push(`${redirect}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!user) return; // User not logged in but anonymous allowed

    // Check single role
    if (options.requiredRole && !hasRole(options.requiredRole)) {
      router.push(options.redirectTo || '/dashboard?error=insufficient_permissions');
      return;
    }

    // Check single permission
    if (options.requiredPermission && !hasPermission(options.requiredPermission)) {
      router.push(options.redirectTo || '/dashboard?error=insufficient_permissions');
      return;
    }

    // Check multiple roles
    if (options.requiredRoles) {
      const hasRequiredRoles = options.requireAll 
        ? hasAllRoles(options.requiredRoles)
        : hasAnyRole(options.requiredRoles);
      
      if (!hasRequiredRoles) {
        router.push(options.redirectTo || '/dashboard?error=insufficient_permissions');
        return;
      }
    }

    // Check multiple permissions
    if (options.requiredPermissions) {
      const hasRequiredPermissions = options.requireAll
        ? options.requiredPermissions.every(permission => hasPermission(permission))
        : hasAnyPermission(options.requiredPermissions);
      
      if (!hasRequiredPermissions) {
        router.push(options.redirectTo || '/dashboard?error=insufficient_permissions');
        return;
      }
    }
  }, [
    loading, 
    user, 
    hasRole, 
    hasPermission, 
    hasAnyRole, 
    hasAllRoles, 
    hasAnyPermission,
    options,
    router
  ]);

  return {
    isProtected: !loading && !!user,
    isLoading: loading,
  };
}
```

### 4. Role-Based Component Protection
- [ ] Create: `src/common/components/RoleProtection.tsx` (under 150 lines)

```typescript
// src/common/components/RoleProtection.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/common/hooks/useAuth';

interface RoleProtectionProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAll?: boolean; // true = AND logic, false = OR logic (default)
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function RoleProtection({
  children,
  requiredRole,
  requiredPermission,  
  requiredRoles,
  requiredPermissions,
  requireAll = false,
  fallback = null,
  showFallback = false,
}: RoleProtectionProps) {
  const { 
    user, 
    loading, 
    hasRole, 
    hasPermission, 
    hasAnyRole, 
    hasAllRoles,
    hasAnyPermission 
  } = useAuth();

  // Show loading state
  if (loading) {
    return showFallback ? fallback : null;
  }

  // User not authenticated
  if (!user) {
    return showFallback ? fallback : null;
  }

  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return showFallback ? fallback : null;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return showFallback ? fallback : null;
  }

  // Check multiple roles
  if (requiredRoles) {
    const hasRequiredRoles = requireAll 
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);
    
    if (!hasRequiredRoles) {
      return showFallback ? fallback : null;
    }
  }

  // Check multiple permissions
  if (requiredPermissions) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);
    
    if (!hasRequiredPermissions) {
      return showFallback ? fallback : null;
    }
  }

  // All checks passed
  return <>{children}</>;
}
```

### 5. Update Login Flow with Role Redirect
- [ ] Modify: `src/app/auth/login/page.tsx`
- [ ] Add role-based post-login redirects

```typescript
// Add to login success handler
const handleLoginSuccess = async (user: User) => {
  // Refresh roles and permissions
  const sessionManager = SessionStateHandler.getInstance();
  await sessionManager.refreshUserRoles();
  
  // Get redirect URL from query params or determine based on role
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('redirect');
  
  if (redirectTo) {
    router.push(redirectTo);
    return;
  }

  // Role-based redirect
  const { hasRole } = useAuth();
  
  if (hasRole('admin')) {
    router.push('/admin');
  } else {
    router.push('/dashboard');
  }
};
```

### 6. Navigation Role Integration
- [ ] Update: `src/app/layout.tsx`
- [ ] Add role-based navigation items

```typescript
// Add role-based navigation to layout
'use client';

import { RoleProtection } from '@/common/components/RoleProtection';

// In navigation section
<RoleProtection requiredPermission="manage_users">
  <Link href="/admin" className="nav-link">
    Admin
  </Link>
</RoleProtection>

<RoleProtection requiredRole="moderator">
  <Link href="/moderation" className="nav-link">
    Moderation
  </Link>
</RoleProtection>
```

### 7. Middleware for Route Protection
- [ ] Create: `src/middleware.ts` (under 150 lines)

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check admin permission (basic check - full check happens in components)
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select(`
        roles!inner(name)
      `)
      .eq('user_id', session.user.id)
      .eq('is_active', true);

    const hasAdminRole = userRoles?.some(ur => ur.roles?.name === 'admin');
    
    if (!hasAdminRole) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
```

### 8. Error Handling for Permission Denied
- [ ] Create: `src/common/components/PermissionDenied.tsx` (under 150 lines)

```typescript
// src/common/components/PermissionDenied.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/primitives/button';
import { Heading } from '@/primitives/heading';

export function PermissionDenied() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  if (error !== 'unauthorized' && error !== 'insufficient_permissions') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <Heading level={2} className="mt-6 text-red-600">
            Access Denied
          </Heading>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this resource. 
            Contact an administrator if you believe this is an error.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Integration Tasks

### 9. Update Existing Components
- [ ] Add role protection to sensitive components
- [ ] Update navigation based on user roles
- [ ] Add permission checks to action buttons

### 10. Testing Integration
- [ ] Test role-based redirects after login
- [ ] Verify middleware protection works
- [ ] Test component-level role protection
- [ ] Validate permission checking performance

## Success Criteria
- [ ] Authentication system enhanced with role information
- [ ] Role-based navigation and component protection works
- [ ] Middleware protects admin routes
- [ ] Permission checks are performant with caching
- [ ] Error handling for permission denied scenarios
- [ ] Seamless integration with existing auth flow
- [ ] All files under 150 lines with proper structure 