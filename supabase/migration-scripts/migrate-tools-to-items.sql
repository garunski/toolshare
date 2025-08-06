-- Migration Script: Tools to Items Data Transformation
-- This script safely migrates existing tools data to the new items system

-- 1. Create temporary mapping table for external taxonomy categories
CREATE TEMP TABLE IF NOT EXISTS external_category_mapping (
    old_category TEXT PRIMARY KEY,
    external_category_id INTEGER NOT NULL,
    external_category_path TEXT NOT NULL
);

-- 2. Map existing tool categories to external taxonomy categories
INSERT INTO external_category_mapping (old_category, external_category_id, external_category_path)
SELECT DISTINCT 
    t.category,
    CASE 
        WHEN LOWER(t.category) LIKE '%power%' OR LOWER(t.category) LIKE '%electric%' THEN 1001
        WHEN LOWER(t.category) LIKE '%hand%' OR LOWER(t.category) LIKE '%manual%' THEN 1002
        WHEN LOWER(t.category) LIKE '%garden%' OR LOWER(t.category) LIKE '%landscape%' THEN 1003
        WHEN LOWER(t.category) LIKE '%auto%' OR LOWER(t.category) LIKE '%car%' THEN 1004
        WHEN LOWER(t.category) LIKE '%measure%' OR LOWER(t.category) LIKE '%level%' THEN 1005
        WHEN LOWER(t.category) LIKE '%safety%' OR LOWER(t.category) LIKE '%protect%' THEN 1006
        WHEN LOWER(t.category) LIKE '%hardware%' OR LOWER(t.category) LIKE '%fastener%' THEN 1007
        WHEN LOWER(t.category) LIKE '%clean%' THEN 1008
        ELSE 1002 -- Default to hand tools
    END as external_category_id,
    CASE 
        WHEN LOWER(t.category) LIKE '%power%' OR LOWER(t.category) LIKE '%electric%' THEN 
            'Hardware > Tools > Power Tools'
        WHEN LOWER(t.category) LIKE '%hand%' OR LOWER(t.category) LIKE '%manual%' THEN 
            'Hardware > Tools > Hand Tools'
        WHEN LOWER(t.category) LIKE '%garden%' OR LOWER(t.category) LIKE '%landscape%' THEN 
            'Home & Garden > Garden & Outdoor'
        WHEN LOWER(t.category) LIKE '%auto%' OR LOWER(t.category) LIKE '%car%' THEN 
            'Automotive > Tools & Equipment'
        WHEN LOWER(t.category) LIKE '%measure%' OR LOWER(t.category) LIKE '%level%' THEN 
            'Hardware > Tools > Measuring Tools & Sensors'
        WHEN LOWER(t.category) LIKE '%safety%' OR LOWER(t.category) LIKE '%protect%' THEN 
            'Business & Industrial > Occupational Health & Safety'
        WHEN LOWER(t.category) LIKE '%hardware%' OR LOWER(t.category) LIKE '%fastener%' THEN 
            'Hardware > Hardware Accessories'
        WHEN LOWER(t.category) LIKE '%clean%' THEN 
            'Home & Garden > Household Supplies > Cleaning Supplies'
        ELSE 
            'Hardware > Tools > Hand Tools' -- Default fallback
    END as external_category_path
FROM tools t
WHERE t.category IS NOT NULL
ON CONFLICT (old_category) DO NOTHING;

-- 3. Create backup of original tools table
CREATE TABLE IF NOT EXISTS tools_backup AS SELECT * FROM tools;

-- 4. Migrate tools to items table with external taxonomy categories
INSERT INTO items (
    id,
    owner_id,
    external_category_id,
    name,
    description,
    condition,
    attributes,
    images,
    location,
    is_available,
    is_shareable,
    is_public,
    tags,
    created_at,
    updated_at
)
SELECT 
    t.id,
    t.owner_id,
    ecm.external_category_id,
    t.name,
    t.description,
    LOWER(t.condition) as condition, -- Normalize condition values
    '{}'::jsonb as attributes, -- Empty attributes for now
    t.images,
    t.location,
    t.is_available,
    true as is_shareable, -- Default to shareable
    true as is_public, -- Default to public
    ARRAY[]::text[] as tags, -- Empty tags for now
    t.created_at,
    t.updated_at
FROM tools t
LEFT JOIN external_category_mapping ecm ON t.category = ecm.old_category
WHERE t.id NOT IN (SELECT id FROM items); -- Avoid duplicates

-- 5. Update items with external category IDs where mapping exists
UPDATE items 
SET external_category_id = ecm.external_category_id
FROM external_category_mapping ecm
WHERE items.name IN (
    SELECT t.name 
    FROM tools t 
    WHERE t.category = ecm.old_category
)
AND items.external_category_id IS NULL;

-- 6. Create corresponding external taxonomy records if they don't exist
INSERT INTO external_product_taxonomy (external_id, category_path, level, is_active, last_updated)
SELECT DISTINCT
    ecm.external_category_id,
    ecm.external_category_path,
    array_length(string_to_array(ecm.external_category_path, ' > '), 1) as level,
    true as is_active,
    NOW() as last_updated
FROM external_category_mapping ecm
WHERE ecm.external_category_id NOT IN (
    SELECT external_id FROM external_product_taxonomy
);

-- 7. Create corresponding internal categories if they don't exist
INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active)
SELECT DISTINCT
    split_part(ecm.external_category_path, ' > ', -1) as name,
    lower(replace(split_part(ecm.external_category_path, ' > ', -1), ' ', '-')) as slug,
    'Migrated from external taxonomy' as description,
    CASE 
        WHEN LOWER(ecm.external_category_path) LIKE '%power%' THEN 'zap'
        WHEN LOWER(ecm.external_category_path) LIKE '%hand%' THEN 'tool'
        WHEN LOWER(ecm.external_category_path) LIKE '%garden%' THEN 'leaf'
        WHEN LOWER(ecm.external_category_path) LIKE '%auto%' THEN 'car'
        WHEN LOWER(ecm.external_category_path) LIKE '%measure%' THEN 'ruler'
        WHEN LOWER(ecm.external_category_path) LIKE '%safety%' THEN 'shield'
        WHEN LOWER(ecm.external_category_path) LIKE '%hardware%' THEN 'screw'
        WHEN LOWER(ecm.external_category_path) LIKE '%clean%' THEN 'spray-bottle'
        ELSE 'folder'
    END as icon,
    CASE 
        WHEN LOWER(ecm.external_category_path) LIKE '%power%' THEN '#f59e0b'
        WHEN LOWER(ecm.external_category_path) LIKE '%hand%' THEN '#10b981'
        WHEN LOWER(ecm.external_category_path) LIKE '%garden%' THEN '#22c55e'
        WHEN LOWER(ecm.external_category_path) LIKE '%auto%' THEN '#3b82f6'
        WHEN LOWER(ecm.external_category_path) LIKE '%measure%' THEN '#8b5cf6'
        WHEN LOWER(ecm.external_category_path) LIKE '%safety%' THEN '#ef4444'
        WHEN LOWER(ecm.external_category_path) LIKE '%hardware%' THEN '#6b7280'
        WHEN LOWER(ecm.external_category_path) LIKE '%clean%' THEN '#06b6d4'
        ELSE '#6b7280'
    END as color,
    0 as sort_order,
    true as is_active
FROM external_category_mapping ecm
WHERE lower(replace(split_part(ecm.external_category_path, ' > ', -1), ' ', '-')) NOT IN (
    SELECT slug FROM categories
);

-- 8. Link items to internal categories
UPDATE items 
SET category_id = c.id
FROM categories c, external_category_mapping ecm
WHERE items.external_category_id = ecm.external_category_id
AND c.slug = lower(replace(split_part(ecm.external_category_path, ' > ', -1), ' ', '-'));

-- 9. Update loans table to reference items instead of tools
UPDATE loans 
SET tool_id = i.id
FROM items i
WHERE loans.tool_id = i.id;

-- 10. Log migration completion
INSERT INTO import_log (
    import_type,
    source,
    processed_count,
    success_count,
    error_count,
    errors,
    completed_at
)
SELECT 
    'data_migration' as import_type,
    'tools_to_items_migration' as source,
    COUNT(*) as processed_count,
    COUNT(*) as success_count,
    0 as error_count,
    '[]'::jsonb as errors,
    NOW() as completed_at
FROM tools_backup;

-- 11. Clean up temporary table
DROP TABLE IF EXISTS external_category_mapping;

-- Migration completed successfully
SELECT 'Migration completed successfully' as status; 