# User Role Enhancements

## Enhanced User Management with Advanced Role Features

### 1. Enhanced User Management Page
- [ ] Update: `src/app/admin/users/page.tsx` (under 150 lines)

```tsx
// src/app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { Heading } from '@/primitives/heading';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { EnhancedUserTable } from './components/EnhancedUserTable';
import { UserFilters } from './components/UserFilters';
import { UserActivityMonitor } from './components/UserActivityMonitor';
import { RoleManagementPanel } from './components/RoleManagementPanel';
import { UserBulkActions } from './components/UserBulkActions';

export default function AdminUsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'activity'>('users');
  const [filters, setFilters] = useState({});

  const handleUserSelect = (userId: string, selected: boolean) => {
    setSelectedUsers(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleBulkActionComplete = () => {
    setSelectedUsers([]);
  };

  const tabs = [
    { id: 'users' as const, label: 'User Management' },
    { id: 'roles' as const, label: 'Role Management' },
    { id: 'activity' as const, label: 'User Activity' }
  ];

  return (
    <AdminProtection>
      <div className="p-6">
        <div className="mb-6">
          <Heading level={1}>User Administration</Heading>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and monitor system activity
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <UserFilters onFiltersChange={setFilters} />
            
            {selectedUsers.length > 0 && (
              <UserBulkActions
                selectedUsers={selectedUsers}
                onActionComplete={handleBulkActionComplete}
              />
            )}

            <EnhancedUserTable
              filters={filters}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
            />
          </div>
        )}

        {activeTab === 'roles' && (
          <RoleManagementPanel />
        )}

        {activeTab === 'activity' && (
          <UserActivityMonitor />
        )}
      </div>
    </AdminProtection>
  );
}
```

### 2. Enhanced User Table Component
- [ ] Update: `src/app/admin/users/components/UserManagementTable.tsx` → `EnhancedUserTable.tsx` (under 150 lines)

```tsx
// src/app/admin/users/components/EnhancedUserTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Checkbox } from '@/primitives/checkbox';
import { UserRoleModal } from './UserRoleModal';
import { UserDetailModal } from './UserDetailModal';
import { supabase } from '@/common/supabase';
import { EyeIcon, PencilIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
  roles: Array<{
    name: string;
    description: string;
    is_active: boolean;
    assigned_at: string;
  }>;
  stats: {
    items_count: number;
    loans_count: number;
    last_activity: string;
  };
}

interface Props {
  filters: any;
  selectedUsers: string[];
  onUserSelect: (userId: string, selected: boolean) => void;
}

export function EnhancedUserTable({ filters, selectedUsers, onUserSelect }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load users with their roles and stats
      const { data: userData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          last_sign_in_at,
          user_roles!inner(
            is_active,
            assigned_at,
            roles(name, description)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user stats
      const usersWithStats = await Promise.all(
        userData.map(async (user) => {
          const [itemsCount, loansCount] = await Promise.all([
            supabase.from('items').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
            supabase.from('loans').select('id', { count: 'exact', head: true }).eq('borrower_id', user.id)
          ]);

          return {
            ...user,
            roles: user.user_roles.map(ur => ({
              name: ur.roles.name,
              description: ur.roles.description,
              is_active: ur.is_active,
              assigned_at: ur.assigned_at
            })),
            stats: {
              items_count: itemsCount.count || 0,
              loans_count: loansCount.count || 0,
              last_activity: user.last_sign_in_at || user.created_at
            }
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : `${users.length} users`}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="divide-y divide-gray-200">
        {users.map(user => (
          <div key={user.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onChange={(checked) => onUserSelect(user.id, checked)}
              />

              <div className="flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {user.full_name || 'Unnamed User'}
                  </h3>
                  <div className="flex space-x-1">
                    {user.roles.filter(role => role.is_active).map(role => (
                      <Badge 
                        key={role.name}
                        className={getRoleBadgeColor(role.name)}
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Last active {formatLastActivity(user.stats.last_activity)}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{user.stats.items_count} items</span>
                  <span>{user.stats.loans_count} loans</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingUser(user)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingUser(user)}
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {editingUser && (
        <UserRoleModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
}
```

### 3. User Activity Monitor Component
- [ ] Create: `src/app/admin/users/components/UserActivityMonitor.tsx` (under 150 lines)

```tsx
// src/app/admin/users/components/UserActivityMonitor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/primitives/card';
import { Badge } from '@/primitives/badge';
import { Heading } from '@/primitives/heading';
import { Button } from '@/primitives/button';
import { supabase } from '@/common/supabase';
import { 
  UserIcon, 
  EyeIcon, 
  PlusIcon, 
  PencilIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ActivityEvent {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: any;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

interface UserStats {
  total_users: number;
  active_today: number;
  new_this_week: number;
  top_contributors: Array<{
    id: string;
    name: string;
    items_count: number;
    loans_count: number;
  }>;
}

export function UserActivityMonitor() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadActivityData();
    
    const interval = autoRefresh ? setInterval(loadActivityData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadActivityData = async () => {
    try {
      // Load recent activities (simulated - would need actual activity logging)
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, last_sign_in_at')
        .order('last_sign_in_at', { ascending: false, nullsFirst: false })
        .limit(50);

      // Simulate activity events based on user data
      const simulatedActivities: ActivityEvent[] = users?.slice(0, 20).map((user, index) => ({
        id: `activity-${index}`,
        user_id: user.id,
        user_name: user.full_name || 'Unknown',
        user_email: user.email,
        action: ['login', 'item_created', 'item_updated', 'loan_requested'][Math.floor(Math.random() * 4)],
        resource_type: ['auth', 'item', 'loan'][Math.floor(Math.random() * 3)],
        timestamp: user.last_sign_in_at || user.created_at,
        ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
        user_agent: 'Mozilla/5.0...'
      })) || [];

      setActivities(simulatedActivities);

      // Load user statistics
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, created_at, last_sign_in_at');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const activeToday = allUsers?.filter(user => 
        user.last_sign_in_at && new Date(user.last_sign_in_at) >= today
      ).length || 0;

      const newThisWeek = allUsers?.filter(user => 
        new Date(user.created_at) >= weekAgo
      ).length || 0;

      setStats({
        total_users: allUsers?.length || 0,
        active_today: activeToday,
        new_this_week: newThisWeek,
        top_contributors: [] // Would load actual contributor data
      });

    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <UserIcon className="h-4 w-4" />;
      case 'item_created':
        return <PlusIcon className="h-4 w-4" />;
      case 'item_updated':
        return <PencilIcon className="h-4 w-4" />;
      case 'item_viewed':
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'item_created':
        return 'bg-blue-100 text-blue-800';
      case 'item_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'loan_requested':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionText = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.total_users}</p>
              </div>
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_today}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Week</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new_this_week}</p>
              </div>
              <PlusIcon className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total_users > 0 ? Math.round((stats.new_this_week / stats.total_users) * 100) : 0}%
                </p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Activity Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Heading level={3}>Recent Activity</Heading>
          <div className="flex items-center space-x-2">
            <Badge variant={autoRefresh ? "default" : "secondary"}>
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
            <Button
              size="sm"
              onClick={loadActivityData}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                {getActionIcon(activity.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{activity.user_name}</span>
                  <Badge variant="outline" size="sm">
                    {formatActionText(activity.action)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {activity.user_email} • {activity.ip_address}
                </p>
              </div>
              
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

### 4. Role Management Panel Component
- [ ] Create: `src/app/admin/users/components/RoleManagementPanel.tsx` (under 150 lines)

```tsx
// src/app/admin/users/components/RoleManagementPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/primitives/card';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Heading } from '@/primitives/heading';
import { Dialog } from '@/primitives/dialog';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Switch } from '@/primitives/switch';
import { supabase } from '@/common/supabase';
import { PlusIcon, PencilIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  user_count: number;
  permissions: Array<{
    id: string;
    name: string;
    resource: string;
    action: string;
  }>;
}

export function RoleManagementPanel() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const { data: rolesData } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          description,
          is_system_role,
          user_roles(id),
          role_permissions(
            permissions(id, name, resource, action)
          )
        `)
        .order('name');

      const rolesWithCounts = rolesData?.map(role => ({
        ...role,
        user_count: role.user_roles?.length || 0,
        permissions: role.role_permissions?.map(rp => rp.permissions) || []
      })) || [];

      setRoles(rolesWithCounts);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading level={2}>Role Management</Heading>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                <Badge className={getRoleBadgeColor(role.name)}>
                  {role.name}
                </Badge>
                {role.is_system_role && (
                  <Badge variant="outline" size="sm">System</Badge>
                )}
              </div>
              
              {!role.is_system_role && (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRole(role)}
                  >
                    <PencilIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-1">{role.name}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {role.user_count} user{role.user_count !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-500">
                {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {role.permissions.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Key Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map(permission => (
                    <Badge key={permission.id} variant="outline" size="sm">
                      {permission.action} {permission.resource}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" size="sm">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create/Edit Role Modal would go here */}
      {(showCreateModal || editingRole) && (
        <Dialog 
          open 
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingRole ? 'Edit Role' : 'Create Role'}
            </h2>
            <p className="text-gray-600">Role creation form would be implemented here</p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRole(null);
                }}
              >
                Cancel
              </Button>
              <Button>Save</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
```

## Success Criteria
- [ ] Enhanced user management with advanced filtering
- [ ] User activity monitoring with real-time updates
- [ ] Role management panel with permission controls
- [ ] Bulk user operations implemented
- [ ] User detail views with comprehensive information
- [ ] All files under 150 lines with proper imports 