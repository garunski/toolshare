-- External Product Taxonomy Integration Migration
-- This migration adds external taxonomy support and migration utilities

-- 1. External Product Taxonomy Table
CREATE TABLE IF NOT EXISTS public.external_product_taxonomy (
    external_id INTEGER PRIMARY KEY,
    category_path TEXT NOT NULL,
    parent_id INTEGER REFERENCES public.external_product_taxonomy(external_id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid category path format
    CONSTRAINT valid_category_path CHECK (category_path ~ '^[^>]+( > [^>]+)*$'),
    -- Prevent self-referencing
    CONSTRAINT no_self_reference CHECK (external_id != parent_id)
);

-- 2. Import Log Table
CREATE TABLE IF NOT EXISTS public.import_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    import_type TEXT NOT NULL,
    source TEXT NOT NULL,
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    backup_id TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_import_type CHECK (import_type IN ('external_taxonomy', 'data_migration', 'category_sync'))
);

-- 3. Taxonomy Backups Table
CREATE TABLE IF NOT EXISTS public.taxonomy_backups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    record_count INTEGER DEFAULT 0,
    size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Import Sessions Table
CREATE TABLE IF NOT EXISTS public.import_sessions (
    id TEXT PRIMARY KEY,
    stage TEXT NOT NULL DEFAULT 'parsing',
    progress INTEGER DEFAULT 0,
    current_batch INTEGER DEFAULT 0,
    total_batches INTEGER DEFAULT 0,
    processed INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    errors JSONB DEFAULT '[]',
    
    CONSTRAINT valid_stage CHECK (stage IN ('parsing', 'validating', 'processing', 'completed', 'failed')),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- 5. Enhanced Items Table with External Category Support
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS external_category_id INTEGER REFERENCES public.external_product_taxonomy(external_id);

-- 6. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_external_taxonomy_parent_id ON public.external_product_taxonomy(parent_id);
CREATE INDEX IF NOT EXISTS idx_external_taxonomy_level ON public.external_product_taxonomy(level);
CREATE INDEX IF NOT EXISTS idx_external_taxonomy_active ON public.external_product_taxonomy(is_active);
CREATE INDEX IF NOT EXISTS idx_external_taxonomy_path ON public.external_product_taxonomy USING gin(to_tsvector('english', category_path));
CREATE INDEX IF NOT EXISTS idx_items_external_category ON public.items(external_category_id);
CREATE INDEX IF NOT EXISTS idx_import_log_type ON public.import_log(import_type);
CREATE INDEX IF NOT EXISTS idx_import_log_completed ON public.import_log(completed_at);

-- 7. Enable Row Level Security
ALTER TABLE public.external_product_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_sessions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies
-- External taxonomy: Public read, admin write
CREATE POLICY "Everyone can view external taxonomy" ON public.external_product_taxonomy
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage external taxonomy" ON public.external_product_taxonomy
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

-- Import log: Admin only
CREATE POLICY "Admin can view import logs" ON public.import_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

CREATE POLICY "Admin can manage import logs" ON public.import_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

-- Taxonomy backups: Admin only
CREATE POLICY "Admin can view taxonomy backups" ON public.taxonomy_backups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

CREATE POLICY "Admin can manage taxonomy backups" ON public.taxonomy_backups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

-- Import sessions: Admin only
CREATE POLICY "Admin can view import sessions" ON public.import_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

CREATE POLICY "Admin can manage import sessions" ON public.import_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

-- 9. Create Helper Functions
-- Function to find external category by path
CREATE OR REPLACE FUNCTION public.find_external_category_by_path(category_path TEXT)
RETURNS INTEGER AS $$
DECLARE
    result INTEGER;
BEGIN
    SELECT external_id INTO result
    FROM public.external_product_taxonomy
    WHERE category_path = $1 AND is_active = true
    LIMIT 1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get external category path by ID
CREATE OR REPLACE FUNCTION public.get_external_category_path(external_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT category_path INTO result
    FROM public.external_product_taxonomy
    WHERE external_id = $1 AND is_active = true;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create taxonomy backup
CREATE OR REPLACE FUNCTION public.create_taxonomy_backup_table(backup_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE TABLE IF NOT EXISTS public.taxonomy_backup_%s AS SELECT * FROM public.external_product_taxonomy', backup_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to copy taxonomy to backup
CREATE OR REPLACE FUNCTION public.copy_taxonomy_to_backup(backup_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('INSERT INTO public.taxonomy_backup_%s SELECT * FROM public.external_product_taxonomy', backup_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore taxonomy from backup
CREATE OR REPLACE FUNCTION public.restore_taxonomy_from_backup(backup_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Clear current taxonomy
    DELETE FROM public.external_product_taxonomy;
    
    -- Restore from backup
    EXECUTE format('INSERT INTO public.external_product_taxonomy SELECT * FROM public.taxonomy_backup_%s', backup_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to drop taxonomy backup table
CREATE OR REPLACE FUNCTION public.drop_taxonomy_backup_table(backup_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('DROP TABLE IF EXISTS public.taxonomy_backup_%s', backup_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create Triggers
-- Update timestamps
CREATE TRIGGER update_external_taxonomy_updated_at
    BEFORE UPDATE ON public.external_product_taxonomy
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_import_log_updated_at
    BEFORE UPDATE ON public.import_log
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taxonomy_backups_updated_at
    BEFORE UPDATE ON public.taxonomy_backups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_import_sessions_updated_at
    BEFORE UPDATE ON public.import_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 