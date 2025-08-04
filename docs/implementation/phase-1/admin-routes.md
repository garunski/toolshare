# Admin Routes Implementation

## Admin Route Structure

### 1. Admin Layout
- [ ] Create: `src/app/admin/layout.tsx` (under 150 lines)

```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { AdminProtection } from './components/AdminProtection';
import { AdminNavigation } from './components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}

export const metadata = {
  title: 'Admin Dashboard - ToolShare',
  description: 'Administrative interface for ToolShare platform',
};
```

### 2. Admin Protection Component
- [ ] Create: `src/app/admin/components/AdminProtection.tsx` (under 150 lines)

```typescript
// src/app/admin/components/AdminProtection.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/common/hooks/usePermissions';
import { useAuth } from '@/common/hooks/useAuth';

interface AdminProtectionProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function AdminProtection({ 
  children, 
  requiredPermission = 'manage_users' 
}: AdminProtectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { checkPermissionSync, isAdmin } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login?redirect=/admin');
      return;
    }

    if (!isAdmin && !checkPermissionSync(requiredPermission)) {
      router.push('/dashboard?error=unauthorized');
      return;
    }
  }, [user, authLoading, isAdmin, checkPermissionSync, requiredPermission, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !checkPermissionSync(requiredPermission))) {
    return null;
  }

  return <>{children}</>;
}
```

### 3. Admin Navigation
- [ ] Create: `src/app/admin/components/AdminNavigation.tsx` (under 150 lines)

```typescript
// src/app/admin/components/AdminNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/common/hooks/useAuth';
import { usePermissions } from '@/common/hooks/usePermissions';
import { Button } from '@/primitives/button';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/primitives/navbar';

const navigationItems = [
  { name: 'Dashboard', href: '/admin', permission: 'view_analytics' },
  { name: 'Users', href: '/admin/users', permission: 'manage_users' },
  { name: 'Roles', href: '/admin/roles', permission: 'manage_roles' },
  { name: 'Categories', href: '/admin/categories', permission: 'manage_categories' },
  { name: 'Attributes', href: '/admin/attributes', permission: 'manage_attributes' },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { checkPermissionSync } = usePermissions();

  const visibleItems = navigationItems.filter(item => 
    checkPermissionSync(item.permission)
  );

  return (
    <Navbar className="border-b border-gray-200 bg-white">
      <NavbarSection>
        <Link href="/admin" className="text-xl font-bold text-gray-900">
          ToolShare Admin
        </Link>
      </NavbarSection>
      
      <NavbarSection>
        {visibleItems.map((item) => (
          <NavbarItem
            key={item.name}
            href={item.href}
            current={pathname === item.href}
          >
            {item.name}
          </NavbarItem>
        ))}
      </NavbarSection>

      <NavbarSpacer />

      <NavbarSection>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </span>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </NavbarSection>
    </Navbar>
  );
}
```

### 4. Admin Dashboard Page
- [ ] Create: `src/app/admin/page.tsx` (under 150 lines)

```typescript
// src/app/admin/page.tsx
import { Suspense } from 'react';
import { AdminDashboardStats } from './components/AdminDashboardStats';
import { AdminRecentActivity } from './components/AdminRecentActivity';
import { Heading } from '@/primitives/heading';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Heading level={1}>Admin Dashboard</Heading>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <AdminDashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading activity...</div>}>
          <AdminRecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
```

### 5. Admin Dashboard Stats Component
- [ ] Create: `src/app/admin/components/AdminDashboardStats.tsx` (under 150 lines)

```typescript
// src/app/admin/components/AdminDashboardStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/common/supabase';

interface DashboardStats {
  totalUsers: number;
  totalTools: number;
  activeLoans: number;
  totalCategories: number;
}

export function AdminDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersResult, toolsResult, loansResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('tools').select('id', { count: 'exact', head: true }),
          supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalTools: toolsResult.count || 0,
          activeLoans: loansResult.count || 0,
          totalCategories: 0, // Will be implemented in future phases
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard stats...</div>;
  }

  if (!stats) {
    return <div>Failed to load dashboard stats</div>;
  }

  const statItems = [
    { name: 'Total Users', value: stats.totalUsers, icon: '👥' },
    { name: 'Total Tools', value: stats.totalTools, icon: '🔧' },
    { name: 'Active Loans', value: stats.activeLoans, icon: '🤝' },
    { name: 'Categories', value: stats.totalCategories, icon: '📂' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 6. User Management Page
- [ ] Create: `src/app/admin/users/page.tsx` (under 150 lines)

```typescript
// src/app/admin/users/page.tsx
import { Suspense } from 'react';
import { UserManagementTable } from './components/UserManagementTable';
import { Heading } from '@/primitives/heading';
import { Button } from '@/primitives/button';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading level={1}>User Management</Heading>
        <Button>Invite User</Button>
      </div>

      <Suspense fallbook={<div>Loading users...</div>}>
        <UserManagementTable />
      </Suspense>
    </div>
  );
}
```

### 7. User Management Table
- [ ] Create: `src/app/admin/users/components/UserManagementTable.tsx` (under 150 lines)

```typescript
// src/app/admin/users/components/UserManagementTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { RoleFormatter } from '@/common/formatters/roleFormatter';
import { UserRoleModal } from './UserRoleModal';
import { Button } from '@/primitives/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/primitives/table';
import { Badge } from '@/primitives/badge';
import type { UserWithRoles } from '@/types/roles';

export function UserManagementTable() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersWithRoles = await RoleManagementOperations.getAllUsersWithRoles();
        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleManageRoles = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge 
                        key={role.id}
                        className={RoleFormatter.getRoleBadgeColor(role.name)}
                      >
                        {RoleFormatter.formatRoleName(role)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="green">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageRoles(user)}
                  >
                    Manage Roles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserRoleModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={() => {
            // Refresh users list
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
```

### 8. User Role Management Modal
- [ ] Create: `src/app/admin/users/components/UserRoleModal.tsx` (under 150 lines)

```typescript
// src/app/admin/users/components/UserRoleModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { RoleManagementOperations } from '@/common/operations/roleManagement';
import { RoleFormatter } from '@/common/formatters/roleFormatter';
import { Button } from '@/primitives/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/primitives/dialog';
import { Select } from '@/primitives/select';
import { Badge } from '@/primitives/badge';
import type { UserWithRoles, Role } from '@/types/roles';

interface UserRoleModalProps {
  user: UserWithRoles;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserRoleModal({ user, isOpen, onClose, onUpdate }: UserRoleModalProps) {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const roles = await RoleManagementOperations.getAllRolesWithPermissions();
        setAvailableRoles(roles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    }

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    setLoading(true);
    try {
      await RoleManagementOperations.assignUserRole({
        userId: user.id,
        roleId: selectedRoleId,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to assign role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    try {
      await RoleManagementOperations.removeUserRole({
        userId: user.id,
        roleId,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to remove role:', error);
    } finally {
      setLoading(false);
    }
  };

  const unassignedRoles = availableRoles.filter(
    role => !user.roles.some(userRole => userRole.id === role.id)
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        Manage Roles for {user.first_name} {user.last_name}
      </DialogTitle>
      
      <DialogBody>
        <DialogDescription>
          Assign or remove roles to control user permissions.
        </DialogDescription>

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Current Roles</h4>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <Badge className={RoleFormatter.getRoleBadgeColor(role.name)}>
                    {RoleFormatter.formatRoleName(role)}
                  </Badge>
                  {!RoleFormatter.isSystemRole(role) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRole(role.id)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {unassignedRoles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Assign New Role</h4>
              <div className="flex gap-2">
                <Select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  <option value="">Select a role...</option>
                  {unassignedRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {RoleFormatter.formatRoleName(role)}
                    </option>
                  ))}
                </Select>
                <Button
                  onClick={handleAssignRole}
                  disabled={!selectedRoleId || loading}
                >
                  Assign
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogBody>

      <DialogActions>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 9. Role Management Page
- [ ] Create: `src/app/admin/roles/page.tsx` (under 150 lines)

```typescript
// src/app/admin/roles/page.tsx
import { Suspense } from 'react';
import { RoleManagementForm } from './components/RoleManagementForm';
import { RolesList } from './components/RolesList';
import { Heading } from '@/primitives/heading';

export default function AdminRolesPage() {
  return (
    <div className="space-y-8">
      <Heading level={1}>Role Management</Heading>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Heading level={2}>Create New Role</Heading>
          <RoleManagementForm />
        </div>
        
        <div>
          <Heading level={2}>Existing Roles</Heading>
          <Suspense fallback={<div>Loading roles...</div>}>
            <RolesList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### 10. Update Main Layout for Admin Link
- [ ] Modify: `src/app/layout.tsx` 
- [ ] Add conditional admin navigation link
- [ ] Import and use permission checking

```typescript
// Add to existing layout.tsx
import { usePermissions } from '@/common/hooks/usePermissions';

// In the navigation section:
const { checkPermissionSync } = usePermissions();

// Add admin link conditionally:
{checkPermissionSync('manage_users') && (
  <Link href="/admin" className="admin-nav-link">
    Admin
  </Link>
)}
```

## Success Criteria
- [ ] Admin routes protected by role-based access control
- [ ] Admin navigation shows only permitted sections
- [ ] User management table displays users with roles
- [ ] Role assignment/removal works correctly
- [ ] Dashboard shows system statistics
- [ ] All components under 150 lines
- [ ] Proper integration with existing auth system 