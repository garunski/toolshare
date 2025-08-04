-- User Roles and Permissions System Schema
-- This adds RBAC (Role-Based Access Control) to the ToolShare platform

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles Table
-- Defines system roles (admin, user, moderator, etc.)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false, -- Prevents deletion of core roles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Permissions Table  
-- Defines granular permissions for different resources and actions
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., 'manage_users', 'view_analytics'
    resource TEXT NOT NULL,    -- e.g., 'users', 'categories', 'tools'
    action TEXT NOT NULL,      -- e.g., 'create', 'read', 'update', 'delete'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Role Permissions Junction Table
-- Links roles to their permissions (many-to-many)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- 4. User Roles Junction Table
-- Links users to their assigned roles (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- 5. Insert Default Roles
INSERT INTO public.roles (name, description, is_system_role) VALUES
    ('admin', 'Full system administrator with all permissions', true),
    ('moderator', 'Community moderator with user management permissions', true),
    ('user', 'Standard user with basic platform access', true),
    ('viewer', 'Read-only access for reporting and analytics', false)
ON CONFLICT (name) DO NOTHING;

-- 6. Insert Default Permissions
INSERT INTO public.permissions (name, resource, action, description) VALUES
    -- User Management
    ('manage_users', 'users', 'all', 'Full user management capabilities'),
    ('view_users', 'users', 'read', 'View user profiles and data'),
    ('assign_roles', 'users', 'update', 'Assign and remove user roles'),
    
    -- Role Management  
    ('manage_roles', 'roles', 'all', 'Create, edit, and delete roles'),
    ('view_roles', 'roles', 'read', 'View role definitions'),
    
    -- Category Management (for future phases)
    ('manage_categories', 'categories', 'all', 'Full category management'),
    ('view_categories', 'categories', 'read', 'View category definitions'),
    
    -- Attribute Management (for future phases)
    ('manage_attributes', 'attributes', 'all', 'Manage dynamic attributes'),
    ('view_attributes', 'attributes', 'read', 'View attribute definitions'),
    
    -- Analytics and Reporting
    ('view_analytics', 'analytics', 'read', 'Access system analytics'),
    ('export_data', 'data', 'read', 'Export system data')
ON CONFLICT (name) DO NOTHING;

-- 7. Assign Permissions to Roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r 
CROSS JOIN public.permissions p 
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Moderator gets user and content management permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r 
CROSS JOIN public.permissions p 
WHERE r.name = 'moderator' 
AND p.name IN ('view_users', 'assign_roles', 'view_roles', 'view_categories', 'view_attributes')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- User gets basic viewing permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r 
CROSS JOIN public.permissions p 
WHERE r.name = 'user' 
AND p.name IN ('view_categories', 'view_attributes')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer gets read-only permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r 
CROSS JOIN public.permissions p 
WHERE r.name = 'viewer' 
AND p.name IN ('view_users', 'view_roles', 'view_categories', 'view_attributes', 'view_analytics')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 8. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);

-- 9. Temporarily disable Row Level Security for initial setup
-- ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;  
-- ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies
-- Roles: Temporarily disable RLS for initial setup
-- Only admins can manage, everyone can view
-- CREATE POLICY "Admin can manage roles" ON public.roles
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM public.user_roles ur
--             JOIN public.roles r ON ur.role_id = r.id
--             WHERE ur.user_id = auth.uid() 
--             AND r.name = 'admin' 
--             AND ur.is_active = true
--         )
--     );

-- CREATE POLICY "Everyone can view roles" ON public.roles
--     FOR SELECT USING (true);

-- Permissions: Temporarily disable RLS for initial setup
-- Only admins can manage, everyone can view  
-- CREATE POLICY "Admin can manage permissions" ON public.permissions
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM public.user_roles ur
--             JOIN public.roles r ON ur.role_id = r.id
--             WHERE ur.user_id = auth.uid() 
--             AND r.name = 'admin' 
--             AND ur.is_active = true
--         )
--     );

-- CREATE POLICY "Everyone can view permissions" ON public.permissions
--     FOR SELECT USING (true);

-- Role Permissions: Temporarily disable RLS for initial setup
-- Only admins can manage, everyone can view
-- CREATE POLICY "Admin can manage role permissions" ON public.role_permissions
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM public.user_roles ur
--             JOIN public.roles r ON ur.role_id = r.id
--             WHERE ur.user_id = auth.uid() 
--             AND r.name = 'admin' 
--             AND ur.is_active = true
--         )
--     );

-- CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
--     FOR SELECT USING (true);

-- User Roles: Temporarily disable RLS for initial setup
-- Users can view their own, admins can manage all
-- CREATE POLICY "Users can view own roles" ON public.user_roles
--     FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Admin can manage user roles" ON public.user_roles
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM public.user_roles ur
--             JOIN public.roles r ON ur.role_id = r.id
--             WHERE ur.user_id = auth.uid() 
--             AND r.name = 'admin' 
--             AND ur.is_active = true
--         )
--     );

-- 11. Create Helper Functions
-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_uuid UUID,
    permission_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_uuid
        AND p.name = permission_name
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid UUID)
RETURNS TABLE(role_name TEXT, role_description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT r.name, r.description
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id  
    WHERE ur.user_id = user_uuid
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Update triggers for updated_at
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assign default 'user' role to new profiles
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'user'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_assign_role
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.assign_default_user_role(); 