# API Endpoints Implementation

## Admin API Routes

### 1. User Management API
- [ ] Create: `src/app/api/admin/users/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { supabase } from '@/common/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verify admin permission
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'manage_users'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all users with roles
    const users = await RoleManagementOperations.getAllUsersWithRoles();
    
    return NextResponse.json({ 
      success: true, 
      data: users 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'manage_users'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName, roleIds } = body;

    // TODO: Implement user creation logic
    // This would involve creating a Supabase Auth user and assigning roles
    
    return NextResponse.json({ 
      success: true, 
      message: 'User creation not yet implemented' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' }, 
      { status: 500 }
    );
  }
}
```

### 2. Role Assignment API
- [ ] Create: `src/app/api/admin/users/[userId]/roles/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/users/[userId]/roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { RoleValidator } from '@/common/validators/roleValidator';
import { supabase } from '@/common/supabase';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'assign_roles'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { roleId, expiresAt } = body;

    // Validate input
    const validatedData = RoleValidator.validateRoleAssignment({
      userId: params.userId,
      roleId,
      expiresAt,
    });

    // Assign role
    const userRole = await RoleManagementOperations.assignUserRole(validatedData);

    return NextResponse.json({ 
      success: true, 
      data: userRole 
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign role' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'assign_roles'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { roleId } = body;

    // Validate input
    const validatedData = RoleValidator.validateRoleRemoval({
      userId: params.userId,
      roleId,
    });

    // Remove role
    await RoleManagementOperations.removeUserRole(validatedData);

    return NextResponse.json({ 
      success: true, 
      message: 'Role removed successfully' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' }, 
      { status: 500 }
    );
  }
}
```

### 3. Role Management API
- [ ] Create: `src/app/api/admin/roles/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { RoleValidator } from '@/common/validators/roleValidator';
import { supabase } from '@/common/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verify permission to view roles
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'view_roles'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all roles with permissions
    const roles = await RoleManagementOperations.getAllRolesWithPermissions();
    
    return NextResponse.json({ 
      success: true, 
      data: roles 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'manage_roles'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = RoleValidator.validateRoleCreation(body);

    // Create role in database
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        is_system_role: validatedData.isSystemRole,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      data: role 
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('validation') || error.message.includes('duplicate')) {
        return NextResponse.json(
          { error: error.message }, 
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create role' }, 
      { status: 500 }
    );
  }
}
```

### 4. Permission Management API
- [ ] Create: `src/app/api/admin/permissions/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { RoleValidator } from '@/common/validators/roleValidator';
import { supabase } from '@/common/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'view_roles'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all permissions
    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch permissions: ${error.message}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      data: permissions 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'manage_roles'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = RoleValidator.validatePermissionCreation(body);

    // Create permission in database
    const { data: permission, error } = await supabase
      .from('permissions')
      .insert({
        name: validatedData.name,
        resource: validatedData.resource,
        action: validatedData.action,
        description: validatedData.description,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create permission: ${error.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      data: permission 
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create permission' }, 
      { status: 500 }
    );
  }
}
```

### 5. Permission Check API
- [ ] Create: `src/app/api/admin/permissions/check/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/permissions/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { RoleValidator } from '@/common/validators/roleValidator';
import { supabase } from '@/common/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, permissionName } = body;

    // If checking for self, allow; otherwise require manage_users permission
    const targetUserId = userId || user.id;
    
    if (targetUserId !== user.id) {
      const hasPermission = await RoleManagementOperations.hasPermission(
        user.id, 
        'manage_users'
      );
      
      if (!hasPermission.hasPermission) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Validate input
    const validatedData = RoleValidator.validatePermissionCheck({
      userId: targetUserId,
      permissionName,
    });

    // Check permission
    const permissionCheck = await RoleManagementOperations.hasPermission(
      validatedData.userId,
      validatedData.permissionName
    );

    return NextResponse.json({ 
      success: true, 
      data: permissionCheck 
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check permission' }, 
      { status: 500 }
    );
  }
}
```

### 6. Admin Analytics API
- [ ] Create: `src/app/api/admin/analytics/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { supabase } from '@/common/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await RoleManagementOperations.hasPermission(
      user.id, 
      'view_analytics'
    );
    
    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch analytics data
    const [
      usersResult,
      toolsResult,
      activeLoansResult,
      totalLoansResult,
      roleDistributionResult
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tools').select('id', { count: 'exact', head: true }),
      supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('loans').select('id', { count: 'exact', head: true }),
      supabase
        .from('user_roles')
        .select('roles(name)', { count: 'exact' })
        .eq('is_active', true)
    ]);

    // Process role distribution
    const roleDistribution = roleDistributionResult.data?.reduce((acc, item) => {
      const roleName = item.roles?.name;
      if (roleName) {
        acc[roleName] = (acc[roleName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const analytics = {
      totalUsers: usersResult.count || 0,
      totalTools: toolsResult.count || 0,
      activeLoans: activeLoansResult.count || 0,
      totalLoans: totalLoansResult.count || 0,
      roleDistribution,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      data: analytics 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' }, 
      { status: 500 }
    );
  }
}
```

## API Response Formats

### Standard Success Response
```typescript
{
  success: true,
  data: any // The actual response data
}
```

### Standard Error Response
```typescript
{
  error: string, // Error message
  code?: string, // Optional error code
  details?: any  // Optional error details
}
```

### Permission Check Response
```typescript
{
  success: true,
  data: {
    hasPermission: boolean,
    roles: string[],
    reason?: string
  }
}
```

### Analytics Response
```typescript
{
  success: true,
  data: {
    totalUsers: number,
    totalTools: number,
    activeLoans: number,
    totalLoans: number,
    roleDistribution: Record<string, number>,
    generatedAt: string
  }
}
```

## API Client Usage Examples

### Frontend API Client Utilities
- [ ] Create: `src/common/operations/adminApiClient.ts` (under 150 lines)

```typescript
// src/common/operations/adminApiClient.ts
class AdminApiClient {
  private static baseUrl = '/api/admin';

  static async fetchUsers() {
    const response = await fetch(`${this.baseUrl}/users`);
    return await response.json();
  }

  static async assignRole(userId: string, roleId: string, expiresAt?: string) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId, expiresAt }),
    });
    return await response.json();
  }

  static async removeRole(userId: string, roleId: string) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/roles`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId }),
    });
    return await response.json();
  }

  static async fetchRoles() {
    const response = await fetch(`${this.baseUrl}/roles`);
    return await response.json();
  }

  static async createRole(roleData: any) {
    const response = await fetch(`${this.baseUrl}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData),
    });
    return await response.json();
  }

  static async checkPermission(userId: string, permissionName: string) {
    const response = await fetch(`${this.baseUrl}/permissions/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permissionName }),
    });
    return await response.json();
  }

  static async fetchAnalytics() {
    const response = await fetch(`${this.baseUrl}/analytics`);
    return await response.json();
  }
}

export default AdminApiClient;
```

## Error Handling Standards

### Authentication Errors (401)
- Missing or invalid auth token
- Expired session

### Authorization Errors (403)
- Insufficient permissions for the requested action
- Role-based access denied

### Validation Errors (400)
- Invalid request body format
- Missing required fields
- Invalid UUID formats

### Server Errors (500)
- Database connection issues
- Unexpected server errors
- External service failures

## Success Criteria
- [ ] All admin API routes implemented and functional
- [ ] Proper authentication and authorization on all endpoints
- [ ] Comprehensive error handling with appropriate status codes
- [ ] Input validation using Zod schemas
- [ ] Consistent response formats across all endpoints
- [ ] API client utilities for frontend integration
- [ ] All files under 150 lines with proper structure 