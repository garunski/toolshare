# Database Schema - Dynamic Categories & Attributes

## Migration File Creation

### 1. Create Migration File
- [ ] Create: `supabase/migrations/[YYYYMMDDHHMMSS]_add_dynamic_categories_attributes.sql`
- [ ] Use format: `20241216120000_add_dynamic_categories_attributes.sql` (replace with current datetime)

### 2. Complete SQL Migration Template

```sql
-- Dynamic Categories and Attributes System Migration
-- This migration adds flexible item categorization and dynamic properties

-- Enable additional extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 1. Categories Table
-- Hierarchical categories with support for parent-child relationships
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    icon TEXT, -- Icon identifier for UI
    color TEXT, -- Color code for UI theming
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Additional category metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure slug is URL-safe
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
    -- Prevent self-referencing
    CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- 2. Attribute Definitions Table
-- Defines dynamic attributes that can be assigned to categories
CREATE TABLE IF NOT EXISTS public.attribute_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- Internal name (e.g., 'power_rating')
    display_label TEXT NOT NULL, -- User-friendly label (e.g., 'Power Rating')
    description TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'boolean', 'date', 'select', 'multi_select', 'url', 'email')),
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}', -- JSON schema for validation
    default_value TEXT, -- Default value as string (parsed based on data_type)
    options JSONB, -- For select/multi_select types: {"options": ["option1", "option2"]}
    display_order INTEGER DEFAULT 0,
    is_searchable BOOLEAN DEFAULT false, -- Whether to index for search
    is_filterable BOOLEAN DEFAULT false, -- Whether to show in filters
    help_text TEXT, -- User guidance text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid names
    CONSTRAINT valid_attribute_name CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- 3. Category Attributes Junction Table
-- Links categories to their available attributes
CREATE TABLE IF NOT EXISTS public.category_attributes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    attribute_definition_id UUID REFERENCES public.attribute_definitions(id) ON DELETE CASCADE NOT NULL,
    is_required BOOLEAN DEFAULT false, -- Override global requirement for this category
    display_order INTEGER DEFAULT 0,
    category_specific_validation JSONB DEFAULT '{}', -- Category-specific validation overrides
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category_id, attribute_definition_id)
);

-- 4. Enhanced Items Table (replaces tools table functionality)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    
    -- Core fields
    name TEXT NOT NULL,
    description TEXT,
    condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    
    -- Dynamic attributes stored as JSONB
    attributes JSONB DEFAULT '{}', -- {"power_rating": "1500W", "brand": "DeWalt", "model": "DWE7491RS"}
    
    -- Media and location
    images TEXT[] DEFAULT '{}',
    location TEXT,
    
    -- Availability and status
    is_available BOOLEAN DEFAULT true,
    is_shareable BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Public vs private listing
    
    -- Search and filtering support
    search_vector tsvector, -- Full-text search
    tags TEXT[] DEFAULT '{}', -- User-defined tags
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Indexes for Performance
-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Attribute definitions indexes
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_name ON public.attribute_definitions(name);
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_data_type ON public.attribute_definitions(data_type);
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_searchable ON public.attribute_definitions(is_searchable);
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_filterable ON public.attribute_definitions(is_filterable);

-- Category attributes indexes
CREATE INDEX IF NOT EXISTS idx_category_attributes_category_id ON public.category_attributes(category_id);
CREATE INDEX IF NOT EXISTS idx_category_attributes_attribute_id ON public.category_attributes(attribute_definition_id);

-- Items indexes
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_available ON public.items(is_available);
CREATE INDEX IF NOT EXISTS idx_items_shareable ON public.items(is_shareable);
CREATE INDEX IF NOT EXISTS idx_items_public ON public.items(is_public);
CREATE INDEX IF NOT EXISTS idx_items_search_vector ON public.items USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_items_attributes ON public.items USING gin(attributes);
CREATE INDEX IF NOT EXISTS idx_items_tags ON public.items USING gin(tags);

-- 6. Insert Sample Categories
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
    ('Power Tools', 'power-tools', 'Electric and battery-powered tools', 'zap', '#f59e0b'),
    ('Hand Tools', 'hand-tools', 'Manual tools and instruments', 'tool', '#10b981'),
    ('Gardening', 'gardening', 'Garden and landscaping tools', 'leaf', '#22c55e'),
    ('Automotive', 'automotive', 'Car and vehicle maintenance tools', 'car', '#3b82f6'),
    ('Measuring', 'measuring', 'Measurement and precision instruments', 'ruler', '#8b5cf6'),
    ('Safety Equipment', 'safety-equipment', 'Personal protective equipment', 'shield', '#ef4444'),
    ('Hardware', 'hardware', 'Fasteners, fittings, and hardware', 'screw', '#6b7280'),
    ('Cleaning', 'cleaning', 'Cleaning and maintenance equipment', 'spray-bottle', '#06b6d4')
ON CONFLICT (slug) DO NOTHING;

-- 7. Insert Sample Attribute Definitions
INSERT INTO public.attribute_definitions (name, display_label, description, data_type, validation_rules, is_searchable, is_filterable) VALUES
    ('brand', 'Brand', 'Manufacturer or brand name', 'text', '{"minLength": 1, "maxLength": 100}', true, true),
    ('model', 'Model', 'Model number or name', 'text', '{"minLength": 1, "maxLength": 100}', true, true),
    ('power_rating', 'Power Rating', 'Electrical power consumption or output', 'text', '{"pattern": "^\\d+(\\.\\d+)?\\s*(W|kW|HP|A|V)$"}', false, true),
    ('weight', 'Weight', 'Item weight with unit', 'text', '{"pattern": "^\\d+(\\.\\d+)?\\s*(kg|lb|g|oz)$"}', false, true),
    ('dimensions', 'Dimensions', 'Length x Width x Height', 'text', '{}', false, false),
    ('material', 'Material', 'Primary material composition', 'select', '{}', false, true),
    ('color', 'Color', 'Primary color', 'select', '{}', false, true),
    ('year_purchased', 'Year Purchased', 'Year the item was purchased', 'number', '{"minimum": 1950, "maximum": 2030}', false, true),
    ('warranty_expiry', 'Warranty Expiry', 'Warranty expiration date', 'date', '{}', false, false),
    ('manual_url', 'Manual URL', 'Link to user manual or documentation', 'url', '{}', false, false),
    ('serial_number', 'Serial Number', 'Manufacturer serial number', 'text', '{"minLength": 1, "maxLength": 50}', false, false),
    ('is_corded', 'Corded/Cordless', 'Whether the tool requires a power cord', 'boolean', '{}', false, true)
ON CONFLICT (name) DO NOTHING;

-- 8. Link Attributes to Categories (Sample Data)
-- Power Tools attributes
INSERT INTO public.category_attributes (category_id, attribute_definition_id, is_required, display_order)
SELECT c.id, ad.id, 
    CASE ad.name  
        WHEN 'brand' THEN true
        WHEN 'model' THEN true  
        WHEN 'power_rating' THEN true
        WHEN 'is_corded' THEN true
        ELSE false
    END as is_required,
    CASE ad.name
        WHEN 'brand' THEN 1
        WHEN 'model' THEN 2
        WHEN 'power_rating' THEN 3
        WHEN 'is_corded' THEN 4
        WHEN 'weight' THEN 5
        WHEN 'serial_number' THEN 6
        ELSE 10
    END as display_order
FROM public.categories c
CROSS JOIN public.attribute_definitions ad
WHERE c.slug = 'power-tools' 
AND ad.name IN ('brand', 'model', 'power_rating', 'is_corded', 'weight', 'serial_number', 'year_purchased', 'warranty_expiry', 'manual_url')
ON CONFLICT (category_id, attribute_definition_id) DO NOTHING;

-- Hand Tools attributes  
INSERT INTO public.category_attributes (category_id, attribute_definition_id, is_required, display_order)
SELECT c.id, ad.id,
    CASE ad.name
        WHEN 'brand' THEN true
        WHEN 'material' THEN true
        ELSE false  
    END as is_required,
    CASE ad.name
        WHEN 'brand' THEN 1
        WHEN 'material' THEN 2
        WHEN 'weight' THEN 3
        WHEN 'dimensions' THEN 4
        ELSE 10
    END as display_order
FROM public.categories c  
CROSS JOIN public.attribute_definitions ad
WHERE c.slug = 'hand-tools'
AND ad.name IN ('brand', 'material', 'weight', 'dimensions', 'year_purchased', 'serial_number')
ON CONFLICT (category_id, attribute_definition_id) DO NOTHING;

-- 9. Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_attributes ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies
-- Categories: Public read, admin write
CREATE POLICY "Everyone can view categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

-- Attribute Definitions: Public read, admin write
CREATE POLICY "Everyone can view attribute definitions" ON public.attribute_definitions
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage attribute definitions" ON public.attribute_definitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'  
            AND ur.is_active = true
        )
    );

-- Category Attributes: Public read, admin write
CREATE POLICY "Everyone can view category attributes" ON public.category_attributes
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage category attributes" ON public.category_attributes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
            AND ur.is_active = true
        )
    );

-- Items: Users can manage their own, view public items
CREATE POLICY "Users can view public items" ON public.items
    FOR SELECT USING (is_public = true AND is_available = true);

CREATE POLICY "Users can view own items" ON public.items  
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own items" ON public.items
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own items" ON public.items
    FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own items" ON public.items
    FOR DELETE USING (auth.uid() = owner_id);

-- 11. Create Helper Functions
-- Function to get category hierarchy path
CREATE OR REPLACE FUNCTION public.get_category_path(category_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    current_category RECORD;
BEGIN
    -- Build path from root to category
    WITH RECURSIVE category_path AS (
        SELECT id, name, parent_id, 0 as level
        FROM public.categories  
        WHERE id = category_uuid
        
        UNION ALL
        
        SELECT c.id, c.name, c.parent_id, cp.level + 1
        FROM public.categories c
        JOIN category_path cp ON c.id = cp.parent_id
    )
    SELECT string_agg(name, ' > ' ORDER BY level DESC) INTO result
    FROM category_path;
    
    RETURN COALESCE(result, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate item attributes against category requirements
CREATE OR REPLACE FUNCTION public.validate_item_attributes(
    category_uuid UUID,
    item_attributes JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    attr_def RECORD;
    attr_value TEXT;
    is_valid BOOLEAN := true;
BEGIN
    -- Check all required attributes for the category
    FOR attr_def IN 
        SELECT ad.name, ad.data_type, ad.is_required, ca.is_required as category_required
        FROM public.attribute_definitions ad
        JOIN public.category_attributes ca ON ad.id = ca.attribute_definition_id  
        WHERE ca.category_id = category_uuid
        AND (ad.is_required = true OR ca.is_required = true)
    LOOP
        attr_value := item_attributes ->> attr_def.name;
        
        -- Check if required attribute is missing or empty
        IF (attr_def.is_required OR attr_def.category_required) 
           AND (attr_value IS NULL OR attr_value = '') THEN
            is_valid := false;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.update_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.attributes::text, '')), 'D');
    
    RETURN NEW;  
END;
$$ LANGUAGE plpgsql;

-- 12. Create Triggers
-- Update timestamps
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attribute_definitions_updated_at  
    BEFORE UPDATE ON public.attribute_definitions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON public.items  
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update search vector on insert/update
CREATE TRIGGER update_item_search_vector_trigger
    BEFORE INSERT OR UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION public.update_item_search_vector();
```

### 3. Apply Migration
- [ ] Run: `task database:db-migrate`
- [ ] Verify migration applied successfully
- [ ] Check tables created: `categories`, `attribute_definitions`, `category_attributes`, `items`

### 4. Generate Types
- [ ] Run: `task database:db-types`
- [ ] Verify new types appear in `src/types/supabase.ts`

### 5. Validation Queries
```sql
-- Verify categories created
SELECT name, slug, parent_id FROM public.categories;

-- Verify attribute definitions
SELECT name, display_label, data_type FROM public.attribute_definitions;

-- Verify category-attribute links
SELECT c.name as category, ad.display_label as attribute, ca.is_required
FROM public.categories c
JOIN public.category_attributes ca ON c.id = ca.category_id
JOIN public.attribute_definitions ad ON ca.attribute_definition_id = ad.id
ORDER BY c.name, ca.display_order;

-- Test helper functions
SELECT public.get_category_path((SELECT id FROM public.categories WHERE slug = 'power-tools'));
```

## Success Criteria
- [ ] All dynamic schema tables created successfully
- [ ] Sample categories and attributes populated
- [ ] Helper functions working correctly
- [ ] RLS policies protecting data appropriately
- [ ] Indexes created for optimal performance
- [ ] Types generated and available in TypeScript 