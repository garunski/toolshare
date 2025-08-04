# Role Operations Implementation

## Core Role Management Functions

### 1. Role Types Definition
- [ ] Create: `src/types/roles.ts` (under 150 lines)

```typescript
// src/types/roles.ts
import { Database } from './supabase';

export type Role = Database['public']['Tables']['roles']['Row'];
export type Permission = Database['public']['Tables']['permissions']['Row'];  
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type RolePermission = Database['public']['Tables']['role_permissions']['Row'];

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  roles: Role[];
}

export interface PermissionCheck {
  hasPermission: boolean;
  roles: string[];
  reason?: string;
}

export type RoleAssignmentRequest = {
  userId: string;
  roleId: string;
  expiresAt?: string;
};

export type RoleRemovalRequest = {
  userId: string;  
  roleId: string;
};
```

### 2. Role Management Operations
- [ ] Create: `src/common/operations/roleManagement.ts` (under 150 lines)

```typescript
// src/common/operations/roleManagement.ts
import { supabase } from '@/common/supabase';
import type { 
  Role, 
  Permission, 
  UserRole, 
  RoleWithPermissions,
  UserWithRoles,
  PermissionCheck,
  RoleAssignmentRequest,
  RoleRemovalRequest 
} from '@/types/roles';

export class RoleManagementOperations {
  
  /**
   * Get all roles with their permissions
   */
  static async getAllRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions!inner(
          permissions(*)
        )
      `);
    
    if (error) throw new Error(`Failed to fetch roles: ${error.message}`);
    
    return data.map(role => ({
      ...role,
      permissions: role.role_permissions.map(rp => rp.permissions).flat()
    }));
  }

  /**
   * Get user roles for specific user
   */
  static async getUserRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.now()');
    
    if (error) throw new Error(`Failed to fetch user roles: ${error.message}`);
    
    return data.map(ur => ur.roles).flat();
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permissionName: string): Promise<PermissionCheck> {
    const { data, error } = await supabase
      .rpc('user_has_permission', {
        user_uuid: userId,
        permission_name: permissionName
      });
    
    if (error) throw new Error(`Permission check failed: ${error.message}`);
    
    const roles = await this.getUserRoles(userId);
    const roleNames = roles.map(r => r.name);
    
    return {
      hasPermission: data,
      roles: roleNames,
      reason: data ? undefined : `User lacks ${permissionName} permission`
    };
  }

  /**
   * Assign role to user
   */
  static async assignUserRole(request: RoleAssignmentRequest): Promise<UserRole> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: request.userId,
        role_id: request.roleId,
        assigned_by: currentUser?.user?.id,
        expires_at: request.expiresAt || null
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to assign role: ${error.message}`);
    
    return data;
  }

  /**
   * Remove role from user
   */
  static async removeUserRole(request: RoleRemovalRequest): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', request.userId)
      .eq('role_id', request.roleId);
    
    if (error) throw new Error(`Failed to remove role: ${error.message}`);
  }

  /**
   * Get all users with their roles (admin function)
   */
  static async getAllUsersWithRoles(): Promise<UserWithRoles[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        user_roles!inner(
          roles(*)
        )
      `);
    
    if (error) throw new Error(`Failed to fetch users with roles: ${error.message}`);
    
    return data.map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      roles: profile.user_roles.map(ur => ur.roles).flat()
    }));
  }
}
```

### 3. Role Validation Schema
- [ ] Create: `src/common/validators/roleValidator.ts` (under 150 lines)

```typescript
// src/common/validators/roleValidator.ts
import { z } from 'zod';

export const roleAssignmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  roleId: z.string().uuid('Invalid role ID format'),
  expiresAt: z.string().datetime().optional(),
});

export const roleRemovalSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  roleId: z.string().uuid('Invalid role ID format'),
});

export const permissionCheckSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  permissionName: z.string().min(1, 'Permission name is required'),
});

export const roleCreationSchema = z.object({
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be less than 50 characters')
    .regex(/^[a-z_]+$/, 'Role name must be lowercase with underscores only'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  isSystemRole: z.boolean().default(false),
});

export const permissionCreationSchema = z.object({
  name: z.string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(50, 'Permission name must be less than 50 characters')
    .regex(/^[a-z_]+$/, 'Permission name must be lowercase with underscores only'),
  resource: z.string()
    .min(2, 'Resource name must be at least 2 characters')
    .max(30, 'Resource name must be less than 30 characters'),
  action: z.enum(['create', 'read', 'update', 'delete', 'all']),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
});

// Type inference from schemas
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
export type RoleRemovalInput = z.infer<typeof roleRemovalSchema>;
export type PermissionCheckInput = z.infer<typeof permissionCheckSchema>;
export type RoleCreationInput = z.infer<typeof roleCreationSchema>;
export type PermissionCreationInput = z.infer<typeof permissionCreationSchema>;

// Validation helper functions
export class RoleValidator {
  static validateRoleAssignment(data: unknown): RoleAssignmentInput {
    return roleAssignmentSchema.parse(data);
  }

  static validateRoleRemoval(data: unknown): RoleRemovalInput {
    return roleRemovalSchema.parse(data);
  }

  static validatePermissionCheck(data: unknown): PermissionCheckInput {
    return permissionCheckSchema.parse(data);
  }

  static validateRoleCreation(data: unknown): RoleCreationInput {
    return roleCreationSchema.parse(data);
  }

  static validatePermissionCreation(data: unknown): PermissionCreationInput {
    return permissionCreationSchema.parse(data);
  }
}
```

### 4. User Roles Hook
- [ ] Create: `src/common/hooks/useUserRoles.ts` (under 150 lines)

```typescript
// src/common/hooks/useUserRoles.ts
import { useState, useEffect, useCallback } from 'react';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { useAuth } from '@/common/hooks/useAuth';
import type { Role, PermissionCheck } from '@/types/roles';

interface UseUserRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => Promise<PermissionCheck>;
  refetch: () => Promise<void>;
}

export function useUserRoles(userId?: string): UseUserRolesReturn {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userRoles = await RoleManagementOperations.getUserRoles(targetUserId);
      setRoles(userRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback((roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  }, [roles]);

  const hasPermission = useCallback(async (permissionName: string): Promise<PermissionCheck> => {
    if (!targetUserId) {
      return { hasPermission: false, roles: [], reason: 'No user ID provided' };
    }

    try {
      return await RoleManagementOperations.hasPermission(targetUserId, permissionName);
    } catch (err) {
      return {
        hasPermission: false,
        roles: [],
        reason: err instanceof Error ? err.message : 'Permission check failed'
      };
    }
  }, [targetUserId]);

  return {
    roles,
    loading,
    error,
    hasRole,
    hasPermission,
    refetch: fetchRoles,
  };
}
```

### 5. Permission Hook
- [ ] Create: `src/common/hooks/usePermissions.ts` (under 150 lines)

```typescript
// src/common/hooks/usePermissions.ts
import { useState, useCallback } from 'react';
import { useUserRoles } from '@/common/hooks/useUserRoles';
import type { PermissionCheck } from '@/types/roles';

interface UsePermissionsReturn {
  checkPermission: (permissionName: string) => Promise<PermissionCheck>;
  checkPermissionSync: (permissionName: string) => boolean;
  requiresPermission: (permissionName: string, fallback?: () => void) => Promise<boolean>;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
}

export function usePermissions(userId?: string): UsePermissionsReturn {
  const { roles, hasRole, hasPermission } = useUserRoles(userId);
  const [permissionCache, setPermissionCache] = useState<Map<string, PermissionCheck>>(new Map());

  const checkPermission = useCallback(async (permissionName: string): Promise<PermissionCheck> => {
    // Check cache first
    const cached = permissionCache.get(permissionName);
    if (cached) return cached;

    try {
      const result = await hasPermission(permissionName);
      
      // Cache the result for 5 minutes
      setPermissionCache(prev => new Map(prev.set(permissionName, result)));
      setTimeout(() => {
        setPermissionCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(permissionName);
          return newCache;
        });
      }, 5 * 60 * 1000); // 5 minutes

      return result;
    } catch (err) {
      return {
        hasPermission: false,
        roles: [],
        reason: err instanceof Error ? err.message : 'Permission check failed'
      };
    }
  }, [hasPermission, permissionCache]);

  const checkPermissionSync = useCallback((permissionName: string): boolean => {
    const cached = permissionCache.get(permissionName);
    return cached?.hasPermission || false;
  }, [permissionCache]);

  const requiresPermission = useCallback(async (
    permissionName: string, 
    fallback?: () => void
  ): Promise<boolean> => {
    const result = await checkPermission(permissionName);
    
    if (!result.hasPermission && fallback) {
      fallback();
    }
    
    return result.hasPermission;
  }, [checkPermission]);

  return {
    checkPermission,
    checkPermissionSync,
    requiresPermission,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    isUser: hasRole('user'),
  };
}
```

### 6. Role Formatters
- [ ] Create: `src/common/formatters/roleFormatter.ts` (under 150 lines)

```typescript
// src/common/formatters/roleFormatter.ts
import type { Role, Permission, UserWithRoles } from '@/types/roles';

export class RoleFormatter {
  /**
   * Format role name for display
   */
  static formatRoleName(role: Role): string {
    return role.name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format permission name for display
   */
  static formatPermissionName(permission: Permission): string {
    return permission.name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get role badge color based on role type
   */
  static getRoleBadgeColor(roleName: string): string {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  }

  /**
   * Format user roles summary
   */
  static formatUserRolesSummary(user: UserWithRoles): string {
    if (user.roles.length === 0) return 'No roles assigned';
    if (user.roles.length === 1) return this.formatRoleName(user.roles[0]);
    
    const primary = user.roles.find(r => r.name === 'admin') || user.roles[0];
    const count = user.roles.length;
    
    return `${this.formatRoleName(primary)} +${count - 1} more`;
  }

  /**
   * Get permission resource and action display
   */
  static formatPermissionDetails(permission: Permission): { resource: string; action: string } {
    return {
      resource: permission.resource.charAt(0).toUpperCase() + permission.resource.slice(1),
      action: permission.action.toUpperCase()
    };
  }

  /**
   * Check if role is system role (cannot be deleted)
   */
  static isSystemRole(role: Role): boolean {
    return role.is_system_role || ['admin', 'user', 'moderator'].includes(role.name);
  }
}
```

## Integration Points

### 7. Update Existing Auth Hook
- [ ] Modify: `src/common/hooks/useAuth.ts`
- [ ] Add role information to auth state
- [ ] Import `useUserRoles` hook
- [ ] Export user roles with auth data

```typescript
// Add to existing useAuth.ts
import { useUserRoles } from '@/common/hooks/useUserRoles';

// Add to the return statement:
const { roles, hasRole } = useUserRoles(user?.id);

return {
  // ... existing returns
  roles,
  hasRole,
  isAdmin: hasRole('admin'),
  isModerator: hasRole('moderator'),
};
```

### 8. Update Session State Handler
- [ ] Modify: `src/common/operations/sessionStateHandler.ts`
- [ ] Include role information in session state
- [ ] Cache user roles for performance

## Testing Tasks
- [ ] Test role assignment and removal functions
- [ ] Verify permission checking works correctly
- [ ] Test role-based hook functionality
- [ ] Validate caching mechanisms work
- [ ] Test integration with existing auth system

## Success Criteria
- [ ] All role operations work correctly
- [ ] Permission checking is fast and reliable
- [ ] Hooks provide reactive role data
- [ ] Integration with existing auth is seamless
- [ ] All files under 150 lines
- [ ] Proper error handling throughout 