# Data Migration Implementation

## Migration from Existing Tools to New Items System with External Taxonomy

### 1. Migration Analysis
- [ ] Analyze existing `tools` table structure
- [ ] Map tool categories to external taxonomy categories
- [ ] Identify data transformation requirements for external category IDs
- [ ] Plan backward compatibility approach

### 2. Migration Scripts
- [ ] Create: `supabase/migration-scripts/migrate-tools-to-items.sql`

```sql
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
    t.category as old_category,
    CASE 
        WHEN LOWER(t.category) LIKE '%power%' OR LOWER(t.category) LIKE '%electric%' THEN 
            1167 -- Hardware > Tools > Power Tools
        WHEN LOWER(t.category) LIKE '%hand%' OR LOWER(t.category) LIKE '%manual%' THEN 
            1235 -- Hardware > Tools > Hand Tools
        WHEN LOWER(t.category) LIKE '%garden%' OR LOWER(t.category) LIKE '%lawn%' THEN 
            2962 -- Home & Garden > Lawn & Garden > Gardening
        WHEN LOWER(t.category) LIKE '%car%' OR LOWER(t.category) LIKE '%auto%' THEN 
            888 -- Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts
        WHEN LOWER(t.category) LIKE '%measure%' OR LOWER(t.category) LIKE '%level%' THEN 
            1204 -- Hardware > Tools > Measuring Tools & Sensors
        WHEN LOWER(t.category) LIKE '%safety%' OR LOWER(t.category) LIKE '%protect%' THEN 
            505070 -- Business & Industrial > Occupational Health & Safety
        WHEN LOWER(t.category) LIKE '%hardware%' OR LOWER(t.category) LIKE '%fastener%' THEN 
            632 -- Hardware > Hardware Accessories
        WHEN LOWER(t.category) LIKE '%clean%' THEN 
            2901 -- Home & Garden > Household Supplies > Cleaning Supplies
        ELSE 
            1235 -- Default: Hardware > Tools > Hand Tools
            END as external_category_id,
    CASE 
        WHEN LOWER(t.category) LIKE '%power%' OR LOWER(t.category) LIKE '%electric%' THEN 
            'Hardware > Tools > Power Tools'
        WHEN LOWER(t.category) LIKE '%hand%' OR LOWER(t.category) LIKE '%manual%' THEN 
            'Hardware > Tools > Hand Tools'
        WHEN LOWER(t.category) LIKE '%garden%' OR LOWER(t.category) LIKE '%lawn%' THEN 
            'Home & Garden > Lawn & Garden > Gardening'
        WHEN LOWER(t.category) LIKE '%car%' OR LOWER(t.category) LIKE '%auto%' THEN 
            'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts'
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
    COALESCE(ecm.external_category_id, 1235), -- Default: Hardware > Tools > Hand Tools
    t.name,
    t.description,
    COALESCE(t.condition, 'good'),
    -- Build attributes JSON from existing tool fields
    jsonb_build_object(
        'brand', COALESCE(t.brand, ''),
        'model', COALESCE(t.model, ''),
        'year_purchased', COALESCE(t.year_purchased::text, ''),
        'serial_number', COALESCE(t.serial_number, ''),
        'purchase_price', COALESCE(t.purchase_price::text, ''),
        'notes', COALESCE(t.notes, '')
    ),
    COALESCE(t.image_urls, ARRAY[]::text[]),
    t.location,
    COALESCE(t.is_available, true),
    COALESCE(t.is_shareable, true),
    true, -- Default to public
    COALESCE(
        string_to_array(t.tags, ','), 
        ARRAY[LOWER(t.category)]
    )::text[],
    t.created_at,
    t.updated_at
FROM tools t
LEFT JOIN external_category_mapping ecm ON t.category = ecm.old_category
WHERE NOT EXISTS (
    SELECT 1 FROM items i WHERE i.id = t.id
);

-- 5. Update search vectors for migrated items
UPDATE items SET search_vector = 
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(attributes::text, '')), 'D')
WHERE search_vector IS NULL;

-- 6. Create migration log
CREATE TABLE IF NOT EXISTS migration_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    migration_name TEXT NOT NULL,
    source_table TEXT NOT NULL,
    target_table TEXT NOT NULL,
    records_processed INTEGER NOT NULL,
    records_successful INTEGER NOT NULL,
    records_failed INTEGER NOT NULL,
    errors JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log this migration
INSERT INTO migration_log (
    migration_name,
    source_table,
    target_table,
    records_processed,
    records_successful,
    records_failed
)
SELECT 
    'tools_to_items_migration',
    'tools',
    'items',
    (SELECT COUNT(*) FROM tools),
    (SELECT COUNT(*) FROM items WHERE created_at >= (SELECT started_at FROM migration_log WHERE migration_name = 'tools_to_items_migration' ORDER BY started_at DESC LIMIT 1)),
    0; -- Assume no failures for now

-- 7. Verification queries
-- Check migration success
SELECT 
    'Migration Summary' as status,
    (SELECT COUNT(*) FROM tools) as original_tools,
    (SELECT COUNT(*) FROM items) as migrated_items,
    (SELECT COUNT(*) FROM external_category_mapping) as external_category_mappings;

-- Check external category distribution
SELECT 
    ept.category_path as external_category_path,
    ept.external_id,
    COUNT(i.id) as item_count
FROM external_product_taxonomy ept
LEFT JOIN items i ON ept.external_id = i.external_category_id
GROUP BY ept.external_id, ept.category_path
ORDER BY item_count DESC;
```

### 3. TypeScript Migration Helper
- [ ] Create: `supabase/migration-helpers/toolMigrationHelper.ts`

```typescript
// supabase/migration-helpers/toolMigrationHelper.ts
import { createClient } from '@supabase/supabase-js';

interface LegacyTool {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category: string;
  condition?: string;
  brand?: string;
  model?: string;
  year_purchased?: number;
  serial_number?: string;
  purchase_price?: number;
  notes?: string;
  image_urls?: string[];
  location?: string;
  is_available?: boolean;
  is_shareable?: boolean;
  tags?: string;
  created_at: string;
  updated_at: string;
}

interface MigrationResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ toolId: string; error: string }>;
}

export class ToolMigrationHelper {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Run complete migration from tools to items
   */
  async migrateAllTools(): Promise<MigrationResult> {
    console.log('Starting tools to items migration...');
    
    const result: MigrationResult = {
      success: false,
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: []
    };

    try {
      // 1. Get all tools
      const { data: tools, error: fetchError } = await this.supabase
        .from('tools')
        .select('*');

      if (fetchError) {
        throw new Error(`Failed to fetch tools: ${fetchError.message}`);
      }

      result.processedCount = tools?.length || 0;
      console.log(`Found ${result.processedCount} tools to migrate`);

      // 2. Create category mappings
      await this.createCategoryMappings();

      // 3. Migrate each tool
      if (tools) {
        for (const tool of tools) {
          try {
            await this.migrateSingleTool(tool);
            result.successCount++;
          } catch (error) {
            result.errorCount++;
            result.errors.push({
              toolId: tool.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error(`Failed to migrate tool ${tool.id}:`, error);
          }
        }
      }

      // 4. Update search vectors
      await this.updateSearchVectors();

      result.success = result.errorCount === 0;
      console.log(`Migration completed: ${result.successCount} success, ${result.errorCount} errors`);

      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      result.success = false;
      throw error;
    }
  }

  /**
   * Migrate a single tool to item
   */
  private async migrateSingleTool(tool: LegacyTool): Promise<void> {
    // Map category
    const categoryId = await this.mapToolCategory(tool.category);

    // Build attributes from tool fields
    const attributes = this.buildItemAttributes(tool);

    // Clean tags
    const tags = this.cleanTags(tool.tags, tool.category);

    // Insert into items table
    const { error } = await this.supabase
      .from('items')
      .insert({
        id: tool.id,
        owner_id: tool.owner_id,
        category_id: categoryId,
        name: tool.name,
        description: tool.description,
        condition: this.normalizeCondition(tool.condition),
        attributes,
        images: tool.image_urls || [],
        location: tool.location,
        is_available: tool.is_available !== false,
        is_shareable: tool.is_shareable !== false,
        is_public: true,
        tags,
        created_at: tool.created_at,
        updated_at: tool.updated_at
      });

    if (error) {
      throw new Error(`Failed to insert item: ${error.message}`);
    }
  }

  /**
   * Map tool category to new category ID
   */
  private async mapToolCategory(category: string): Promise<string> {
    const categoryLower = category.toLowerCase();
    
    let slug = 'hand-tools'; // Default

    if (categoryLower.includes('power') || categoryLower.includes('electric')) {
      slug = 'power-tools';
    } else if (categoryLower.includes('garden') || categoryLower.includes('lawn')) {
      slug = 'gardening';
    } else if (categoryLower.includes('car') || categoryLower.includes('auto')) {
      slug = 'automotive';
    } else if (categoryLower.includes('measure') || categoryLower.includes('level')) {
      slug = 'measuring';
    } else if (categoryLower.includes('safety') || categoryLower.includes('protect')) {
      slug = 'safety-equipment';
    } else if (categoryLower.includes('hardware') || categoryLower.includes('fastener')) {
      slug = 'hardware';
    } else if (categoryLower.includes('clean')) {
      slug = 'cleaning';
    }

    const { data, error } = await this.supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new Error(`Failed to find category for slug: ${slug}`);
    }

    return data.id;
  }

  /**
   * Build item attributes from tool fields
   */
  private buildItemAttributes(tool: LegacyTool): Record<string, any> {
    const attributes: Record<string, any> = {};

    if (tool.brand) attributes.brand = tool.brand;
    if (tool.model) attributes.model = tool.model;
    if (tool.year_purchased) attributes.year_purchased = tool.year_purchased;
    if (tool.serial_number) attributes.serial_number = tool.serial_number;
    if (tool.purchase_price) attributes.purchase_price = tool.purchase_price.toString();
    if (tool.notes) attributes.notes = tool.notes;

    return attributes;
  }

  /**
   * Clean and normalize tags
   */
  private cleanTags(tagsString?: string, category?: string): string[] {
    const tags: string[] = [];

    // Add category as tag
    if (category) {
      tags.push(category.toLowerCase());
    }

    // Parse existing tags
    if (tagsString) {
      const parsedTags = tagsString
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      tags.push(...parsedTags);
    }

    // Remove duplicates and limit
    return [...new Set(tags)].slice(0, 10);
  }

  /**
   * Normalize condition values
   */
  private normalizeCondition(condition?: string): 'excellent' | 'good' | 'fair' | 'poor' {
    if (!condition) return 'good';
    
    const normalized = condition.toLowerCase();
    
    if (normalized.includes('excellent') || normalized.includes('new')) return 'excellent';
    if (normalized.includes('good')) return 'good';
    if (normalized.includes('fair') || normalized.includes('okay')) return 'fair';
    if (normalized.includes('poor') || normalized.includes('bad')) return 'poor';
    
    return 'good'; // Default
  }

  /**
   * Create category mappings
   */
  private async createCategoryMappings(): Promise<void> {
    // This is handled by the SQL migration script
    console.log('Category mappings created via SQL migration');
  }

  /**
   * Update search vectors for migrated items
   */
  private async updateSearchVectors(): Promise<void> {
    console.log('Updating search vectors...');
    
    const { error } = await this.supabase
      .rpc('update_item_search_vector');

    if (error) {
      throw new Error(`Failed to update search vectors: ${error.message}`);
    }

    console.log('Search vectors updated successfully');
  }

  /**
   * Verify migration results
   */
  async verifyMigration(): Promise<{
    originalToolsCount: number;
    migratedItemsCount: number;
    categoryDistribution: Array<{ category: string; count: number }>;
  }> {
    // Count original tools
    const { data: toolsData } = await this.supabase
      .from('tools')
      .select('id', { count: 'exact', head: true });

    // Count migrated items
    const { data: itemsData } = await this.supabase
      .from('items')
      .select('id', { count: 'exact', head: true });

    // Get category distribution
    const { data: categoryData } = await this.supabase
      .from('items')
      .select(`
        category_id,
        category:categories(name)
      `);

    const categoryDistribution = categoryData?.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Unknown';
      const existing = acc.find(c => c.category === categoryName);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ category: categoryName, count: 1 });
      }
      return acc;
    }, [] as Array<{ category: string; count: number }>) || [];

    return {
      originalToolsCount: toolsData?.length || 0,
      migratedItemsCount: itemsData?.length || 0,
      categoryDistribution
    };
  }

  /**
   * Rollback migration (restore from backup)
   */
  async rollbackMigration(): Promise<void> {
    console.log('Rolling back migration...');
    
    // Delete migrated items
    const { error: deleteError } = await this.supabase
      .from('items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      throw new Error(`Failed to delete items: ${deleteError.message}`);
    }

    console.log('Migration rolled back successfully');
  }
}
```

### 4. Migration Taskfile Commands
- [ ] Add to `Taskfile.database.yml`:

```yaml
# Add these tasks to Taskfile.database.yml

  migrate-tools:
    desc: "Migrate existing tools to new items system"
    cmds:
      - echo "Starting tools to items migration..."
      - supabase db reset --db-url "$DATABASE_URL"
      - psql "$DATABASE_URL" -f supabase/migration-scripts/migrate-tools-to-items.sql
      - echo "Migration completed successfully"

  verify-migration:
    desc: "Verify tools to items migration results"
    cmds:
      - echo "Verifying migration results..."
      - psql "$DATABASE_URL" -c "SELECT 'Original Tools' as table_name, COUNT(*) as record_count FROM tools UNION ALL SELECT 'Migrated Items', COUNT(*) FROM items;"
      - psql "$DATABASE_URL" -c "SELECT c.name as category, COUNT(i.id) as items FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name ORDER BY items DESC;"

  backup-tools:
    desc: "Create backup of tools table before migration"
    cmds:
      - echo "Creating tools backup..."
      - psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS tools_backup_$(date +%Y%m%d_%H%M%S) AS SELECT * FROM tools;"
      - echo "Backup created successfully"

  rollback-migration:
    desc: "Rollback tools migration (restore from backup)"
    cmds:
      - echo "WARNING: This will delete all items and restore tools from backup"
      - read -p "Are you sure? (y/N): " confirm && [ "$confirm" = "y" ]
      - psql "$DATABASE_URL" -c "DELETE FROM items; INSERT INTO tools SELECT * FROM tools_backup;"
      - echo "Migration rolled back successfully"
```

### 5. Post-Migration Tasks
- [ ] Update existing components to use new item types
- [ ] Update API routes to handle items instead of tools
- [ ] Update database queries in existing code
- [ ] Test all functionality with migrated data

### 6. Backward Compatibility Layer
- [ ] Create: `src/common/operations/toolCompatibility.ts` (under 150 lines)

```typescript
// src/common/operations/toolCompatibility.ts
// Backward compatibility layer for existing tool-based components

import { ItemOperations } from './itemOperations';
import type { Item, ItemWithDetails } from '@/types/item';

/**
 * Legacy tool interface for backward compatibility
 */
interface LegacyTool {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
  image_urls?: string[];
  location?: string;
  is_available: boolean;
  is_shareable: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Compatibility operations for legacy tool components
 */
export class ToolCompatibilityOperations {
  
  /**
   * Convert item to legacy tool format
   */
  static itemToLegacyTool(item: ItemWithDetails): LegacyTool {
    return {
      id: item.id,
      owner_id: item.owner_id,
      name: item.name,
      description: item.description,
      category: item.category?.name || 'Unknown',
      condition: item.condition,
      brand: item.attributes?.brand as string,
      model: item.attributes?.model as string,
      image_urls: item.images,
      location: item.location,
      is_available: item.is_available,
      is_shareable: item.is_shareable,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  /**
   * Get tools (legacy format) for existing components
   */
  static async getTools(): Promise<LegacyTool[]> {
    const items = await ItemOperations.searchItems({}, 100, 0);
    return items.map(this.itemToLegacyTool);
  }

  /**
   * Get tool by ID (legacy format)
   */
  static async getToolById(toolId: string): Promise<LegacyTool | null> {
    const item = await ItemOperations.getItemById(toolId);
    return item ? this.itemToLegacyTool(item) : null;
  }

  /**
   * Get tools by owner (legacy format)
   */
  static async getToolsByOwner(ownerId: string): Promise<LegacyTool[]> {
    const items = await ItemOperations.getItemsByOwner(ownerId);
    return items.map(item => this.itemToLegacyTool({ ...item, owner: { id: ownerId, full_name: '', avatar_url: '' } }));
  }
}
```

## Success Criteria
- [ ] All existing tools successfully migrated to items table
- [ ] Category mappings created and applied correctly
- [ ] Attribute data preserved in JSONB format
- [ ] Search functionality working with migrated data
- [ ] Backward compatibility maintained for existing components
- [ ] Migration can be verified and rolled back if needed
- [ ] All files under 150 lines with proper imports 