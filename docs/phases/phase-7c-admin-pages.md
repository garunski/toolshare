# Phase 7c: Admin Pages Data Extraction

## 🎯 Objective
Convert admin pages from client-side data fetching to server components, focusing on admin-specific functionality with proper authentication and authorization.

---

## 📋 Target Files (5 pages)

### 1. `src/app/admin/users/page.tsx` - User Management
**Current State:** Client-side user list with management features
**Complexity:** ⭐⭐⭐ High (admin auth, user management)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current user management data fetching
- [ ] Create `src/app/admin/users/getUsers.ts` server function
- [ ] Add server-side admin authentication checks
- [ ] Convert page to server component
- [ ] Create `components/AdminUsersList` UI component
- [ ] Create `components/UserManagementActions` client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update user role management functionality
- [ ] Run `task validate` and fix any issues

### 2. `src/app/admin/categories/page.tsx` - Category Management
**Current State:** Category list with CRUD operations
**Complexity:** ⭐⭐⭐ High (admin auth, category management)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current category management logic
- [ ] Create `src/app/admin/categories/getCategories.ts` server function
- [ ] Add server-side admin authentication checks
- [ ] Convert page to server component
- [ ] Create `components/CategoriesList` UI component
- [ ] Create `components/CategoryManagementActions` client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update category CRUD functionality
- [ ] Run `task validate` and fix any issues

### 3. `src/app/admin/categories/external/page.tsx` - External Categories
**Current State:** External category integration page
**Complexity:** ⭐⭐ Medium (admin auth, external data)
**Estimated Time:** 1 hour

**Sub-tasks:**
- [ ] Analyze current external category fetching
- [ ] Create `src/app/admin/categories/external/getExternalCategories.ts` server function
- [ ] Add server-side admin authentication checks
- [ ] Convert page to server component
- [ ] Create `components/ExternalCategoriesList` UI component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update external category sync functionality
- [ ] Run `task validate` and fix any issues

### 4. `src/app/admin/attributes/page.tsx` - Attribute Management
**Current State:** Attribute management with complex state
**Complexity:** ⭐⭐⭐⭐ Very High (admin auth, complex attribute logic)
**Estimated Time:** 2 hours

**Sub-tasks:**
- [ ] Analyze current attribute management complexity
- [ ] Create `src/app/admin/attributes/getAttributes.ts` server function
- [ ] Add server-side admin authentication checks
- [ ] Convert page to server component
- [ ] Create `components/AttributesList` UI component
- [ ] Create `components/AttributeFormModal` client component
- [ ] Create `components/AttributeManagementActions` client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update attribute CRUD functionality
- [ ] Run `task validate` and fix any issues

### 5. `src/app/admin/roles/page.tsx` - Role Management
**Current State:** Role and permission management
**Complexity:** ⭐⭐⭐ High (admin auth, role management)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current role management logic
- [ ] Create `src/app/admin/roles/getRoles.ts` server function
- [ ] Add server-side admin authentication checks
- [ ] Convert page to server component
- [ ] Create `components/RolesList` UI component
- [ ] Create `components/RoleManagementActions` client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update role and permission functionality
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Server Function Template with Admin Auth

```typescript
// src/app/admin/users/getUsers.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getUsers() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  
  // Check admin permissions
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (userRole?.role !== 'admin') {
    redirect('/dashboard');
  }
  
  // Fetch users with roles
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(role, created_at)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Get role statistics
  const { data: roleStats } = await supabase
    .from('user_roles')
    .select('role')
    .order('role');
    
  return {
    users: users || [],
    roleStats: roleStats || []
  };
}
```

```typescript
// src/app/admin/categories/getCategories.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getCategories() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // Check admin auth (reusable pattern)
  await checkAdminAuth(supabase);
  
  // Fetch categories with item counts
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      items(count)
    `)
    .order('name');
    
  if (error) throw error;
  
  // Get category statistics
  const { data: categoryStats } = await supabase
    .from('items')
    .select('category_id')
    .not('category_id', 'is', null);
    
  return {
    categories: categories || [],
    totalItems: categoryStats?.length || 0
  };
}

// Helper function for admin auth checks
async function checkAdminAuth(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (userRole?.role !== 'admin') redirect('/dashboard');
}
```

```typescript
// src/app/admin/attributes/getAttributes.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getAttributes() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  await checkAdminAuth(supabase);
  
  // Fetch attributes with usage counts
  const { data: attributes, error } = await supabase
    .from('attributes')
    .select(`
      *,
      category_attributes(
        categories(name)
      )
    `)
    .order('name');
    
  if (error) throw error;
  
  // Get attribute types for filtering
  const attributeTypes = [...new Set(attributes?.map(attr => attr.type) || [])];
  
  // Get usage statistics
  const { data: usageStats } = await supabase
    .from('category_attributes')
    .select('attribute_id')
    .not('attribute_id', 'is', null);
    
  return {
    attributes: attributes || [],
    attributeTypes,
    usageStats: usageStats || []
  };
}
```

### Page Conversion Examples

```typescript
// Before: src/app/admin/users/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';

export default function AdminUsersPage() {
  const { isAdmin, loading: permLoading } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);
  
  // ... client-side logic
}

// After: src/app/admin/users/page.tsx
import { getUsers } from './getUsers';
import { AdminUsersList } from './components/AdminUsersList';
import { UserManagementActions } from './components/UserManagementActions';

export default async function AdminUsersPage() {
  const { users, roleStats } = await getUsers();
  
  return (
    <div>
      <h1>User Management</h1>
      <UserManagementActions />
      <AdminUsersList users={users} roleStats={roleStats} />
    </div>
  );
}
```

### UI Component Examples

```typescript
// src/app/admin/users/components/AdminUsersList/index.tsx
interface AdminUsersListProps {
  users: UserWithRole[];
  roleStats: RoleStats[];
}

export function AdminUsersList({ users, roleStats }: AdminUsersListProps) {
  if (!users.length) {
    return (
      <div className="empty-state">
        <p>No users found.</p>
      </div>
    );
  }
  
  return (
    <div className="users-management">
      <div className="stats-overview">
        {/* Role statistics */}
      </div>
      
      <div className="users-list">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/app/admin/users/components/UserManagementActions/index.tsx
'use client';
import { useState } from 'react';

export function UserManagementActions() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  return (
    <div className="management-actions">
      <button onClick={() => setShowCreateModal(true)}>
        Create New User
      </button>
      
      {/* Other admin actions */}
      
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `getUsers.ts` server function created
- [ ] `getCategories.ts` server function created
- [ ] `getExternalCategories.ts` server function created
- [ ] `getAttributes.ts` server function created
- [ ] `getRoles.ts` server function created
- [ ] All 5 pages converted to server components
- [ ] All 10 error.tsx and loading.tsx files created
- [ ] UI components extracted from pages

### Security Verification
- [ ] All server functions include admin authentication checks
- [ ] Unauthorized access redirects to appropriate pages
- [ ] User role verification works correctly
- [ ] No sensitive data exposed to non-admin users
- [ ] Proper error handling for auth failures

### Functionality Verification
- [ ] Admin user management works correctly
- [ ] Category management CRUD operations work
- [ ] External category sync functionality works
- [ ] Attribute management complex operations work
- [ ] Role and permission management works
- [ ] All admin features preserved after conversion

### Code Quality Verification
- [ ] No client-side data fetching in pages
- [ ] Consistent admin auth patterns across pages
- [ ] Proper TypeScript interfaces for admin data
- [ ] Error boundaries handle auth failures gracefully
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 5 admin pages converted to server components
- ✅ 5 server data fetching functions with admin auth created
- ✅ Proper authentication and authorization implemented
- ✅ All admin functionality preserved
- ✅ Security measures properly implemented
- ✅ No client-side data fetching in admin pages
- ✅ Interactive admin features preserved as client components
- ✅ Consistent admin auth patterns established
- ✅ `task validate` passes without errors

---

*Phase 7c focuses on admin functionality, establishing secure server-side authentication patterns and proper authorization checks.*
