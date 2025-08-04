# External Taxonomy Integration

## TSV Import and Database Population System

### 1. Taxonomy Import Service
- [ ] Create: `src/common/operations/taxonomyImporter.ts` (under 150 lines)

```typescript
// src/common/operations/taxonomyImporter.ts
import { supabase } from '@/common/supabase';

interface TaxonomyRecord {
  external_id: number;
  category_path: string;
  parent_id?: number;
  level: number;
}

export class TaxonomyImporter {
  
  /**
   * Import taxonomy from TSV URL
   */
  static async importFromTSV(sourceUrl: string): Promise<{ success: boolean; imported: number; errors: string[] }> {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch taxonomy: ${response.statusText}`);
      }
      
      const tsvContent = await response.text();
      const records = this.parseTSVContent(tsvContent);
      
      return await this.storeTaxonomyRecords(records);
    } catch (error) {
      console.error('Taxonomy import failed:', error);
      return { success: false, imported: 0, errors: [error.message] };
    }
  }

  /**
   * Parse TSV content into taxonomy records
   */
  private static parseTSVContent(tsvContent: string): TaxonomyRecord[] {
    const lines = tsvContent.trim().split('\n');
    const records: TaxonomyRecord[] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [idStr, categoryPath] = line.split('\t');
      const external_id = parseInt(idStr.trim());
      
      if (isNaN(external_id) || !categoryPath) continue;
      
      const pathParts = categoryPath.trim().split(' > ');
      const level = pathParts.length;
      
      // Find parent by reconstructing parent path
      let parent_id: number | undefined;
      if (level > 1) {
        const parentPath = pathParts.slice(0, -1).join(' > ');
        const parentRecord = records.find(r => r.category_path === parentPath);
        parent_id = parentRecord?.external_id;
      }
      
      records.push({
        external_id,
        category_path: categoryPath.trim(),
        parent_id,
        level
      });
    }
    
    return records;
  }

  /**
   * Store taxonomy records in database
   */
  private static async storeTaxonomyRecords(records: TaxonomyRecord[]): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;
    
    // Clear existing taxonomy
    await supabase.from('external_product_taxonomy').delete().neq('external_id', 0);
    
    // Insert in batches to handle large datasets
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('external_product_taxonomy')
        .insert(batch.map(record => ({
          external_id: record.external_id,
          category_path: record.category_path,
          parent_id: record.parent_id,
          level: record.level,
          is_active: true,
          last_updated: new Date().toISOString()
        })));
      
      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        imported += batch.length;
      }
    }
    
    return { success: errors.length === 0, imported, errors };
  }

  /**
   * Get import statistics
   */
  static async getImportStats(): Promise<{
    totalCategories: number;
    lastImportDate: string | null;
    topLevelCategories: number;
  }> {
    const { data, error } = await supabase
      .from('external_product_taxonomy')
      .select('external_id, level, last_updated')
      .eq('is_active', true);
    
    if (error || !data) {
      return { totalCategories: 0, lastImportDate: null, topLevelCategories: 0 };
    }
    
    const lastImportDate = data.length > 0 
      ? data.reduce((latest, record) => 
          new Date(record.last_updated) > new Date(latest) ? record.last_updated : latest, 
          data[0].last_updated
        )
      : null;
    
    return {
      totalCategories: data.length,
      lastImportDate,
      topLevelCategories: data.filter(record => record.level === 1).length
    };
  }
}
```

### 2. Taxonomy Import API Endpoint
- [ ] Create: `src/app/api/admin/taxonomy/import/route.ts` (under 150 lines)

```typescript
// src/app/api/admin/taxonomy/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyImporter } from '@/common/operations/taxonomyImporter';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check admin permissions
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:roles(name)')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(ur => ur.role?.name === 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { sourceUrl } = await request.json();
    
    if (!sourceUrl) {
      return NextResponse.json({ error: 'Source URL required' }, { status: 400 });
    }

    // Start import process
    const result = await TaxonomyImporter.importFromTSV(sourceUrl);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.imported} categories`,
        stats: {
          imported: result.imported,
          errors: result.errors
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Import completed with errors',
        stats: {
          imported: result.imported,
          errors: result.errors
        }
      }, { status: 207 }); // Multi-status
    }

  } catch (error) {
    console.error('Taxonomy import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = await TaxonomyImporter.getImportStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching import stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import statistics' },
      { status: 500 }
    );
  }
}
```

### 3. Admin Import Interface
- [ ] Create: `src/app/admin/taxonomy/page.tsx` (under 150 lines)

```tsx
// src/app/admin/taxonomy/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { Heading } from '@/primitives/heading';
import { Badge } from '@/primitives/badge';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { TaxonomyImportStats } from './components/TaxonomyImportStats';
import { useTaxonomyImport } from '@/common/hooks/useTaxonomyImport';

export default function AdminTaxonomyPage() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { stats, loading: statsLoading, refetch } = useTaxonomyImport();

  const handleImport = async () => {
    if (!sourceUrl.trim()) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const response = await fetch('/api/admin/taxonomy/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: JSON.stringify({ sourceUrl: sourceUrl.trim() })
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        refetch();
      }
    } catch (error) {
      setImportResult({ 
        success: false, 
        message: 'Network error during import',
        errors: [error.message] 
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminProtection>
      <div className="p-6 space-y-8">
        <div>
          <Heading level={1}>Taxonomy Management</Heading>
          <p className="text-gray-600 mt-1">
            Import and manage external product taxonomy
          </p>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <Heading level={2} className="mb-4">Import External Taxonomy</Heading>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TSV Source URL
              </label>
              <Input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/taxonomy.txt"
                disabled={importing}
              />
            </div>
            
            <Button
              onClick={handleImport}
              disabled={!sourceUrl.trim() || importing}
              variant={importing ? 'outline' : 'solid'}
            >
              {importing ? 'Importing...' : 'Import Taxonomy'}
            </Button>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {importResult.message}
              </p>
              {importResult.stats && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Imported: {importResult.stats.imported} categories</p>
                  {importResult.stats.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-red-700">Errors:</p>
                      <ul className="list-disc list-inside">
                        {importResult.stats.errors.map((error, index) => (
                          <li key={index} className="text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Stats */}
        <TaxonomyImportStats stats={stats} loading={statsLoading} />
      </div>
    </AdminProtection>
  );
}
```

### 4. Import Statistics Hook
- [ ] Create: `src/common/hooks/useTaxonomyImport.ts` (under 150 lines)

```typescript
// src/common/hooks/useTaxonomyImport.ts
import { useState, useEffect } from 'react';

interface TaxonomyStats {
  totalCategories: number;
  lastImportDate: string | null;
  topLevelCategories: number;
}

export function useTaxonomyImport() {
  const [stats, setStats] = useState<TaxonomyStats>({
    totalCategories: 0,
    lastImportDate: null,
    topLevelCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/taxonomy/import');
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}
```

### 5. Import Statistics Component
- [ ] Create: `src/app/admin/taxonomy/components/TaxonomyImportStats.tsx` (under 150 lines)

```tsx
// src/app/admin/taxonomy/components/TaxonomyImportStats.tsx
'use client';

import { Badge } from '@/primitives/badge';
import { Heading } from '@/primitives/heading';
import { Card } from '@/primitives/card';
import { CloudArrowDownIcon, TagIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface Props {
  stats: {
    totalCategories: number;
    lastImportDate: string | null;
    topLevelCategories: number;
  };
  loading: boolean;
}

export function TaxonomyImportStats({ stats, loading }: Props) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level={2}>Taxonomy Statistics</Heading>
        <Badge variant={stats.totalCategories > 0 ? 'success' : 'secondary'}>
          {stats.totalCategories > 0 ? 'Active' : 'No Data'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <TagIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCategories.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Categories</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <CloudArrowDownIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.topLevelCategories}</p>
          <p className="text-sm text-gray-600">Top Level Categories</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <CalendarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatDate(stats.lastImportDate)}</p>
          <p className="text-sm text-gray-600">Last Import</p>
        </div>
      </div>

      {stats.totalCategories === 0 && (
        <div className="mt-6 text-center py-8 text-gray-500">
          <CloudArrowDownIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No taxonomy data imported yet</p>
          <p className="text-sm mt-1">Use the import form above to load external taxonomy</p>
        </div>
      )}
    </Card>
  );
}
```

### 6. Taxonomy Validator
- [ ] Create: `src/common/validators/taxonomyValidator.ts` (under 150 lines)

```typescript
// src/common/validators/taxonomyValidator.ts
import { z } from 'zod';

export const taxonomyRecordValidator = z.object({
  external_id: z.number().int().positive(),
  category_path: z.string().min(1).max(500),
  parent_id: z.number().int().positive().optional(),
  level: z.number().int().min(1).max(10),
  is_active: z.boolean().default(true),
  last_updated: z.string().datetime().optional()
});

export const taxonomyImportRequestValidator = z.object({
  sourceUrl: z.string().url(),
  replaceExisting: z.boolean().default(true),
  validateStructure: z.boolean().default(true)
});

export const taxonomyImportResultValidator = z.object({
  success: z.boolean(),
  imported: z.number().int().min(0),
  errors: z.array(z.string()),
  stats: z.object({
    totalCategories: z.number().int().min(0),
    lastImportDate: z.string().datetime().nullable(),
    topLevelCategories: z.number().int().min(0)
  }).optional()
});

export type TaxonomyRecord = z.infer<typeof taxonomyRecordValidator>;
export type TaxonomyImportRequest = z.infer<typeof taxonomyImportRequestValidator>;
export type TaxonomyImportResult = z.infer<typeof taxonomyImportResultValidator>;

export class TaxonomyValidator {
  
  /**
   * Validate taxonomy structure integrity
   */
  static validateHierarchy(records: TaxonomyRecord[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const idMap = new Map(records.map(r => [r.external_id, r]));
    
    for (const record of records) {
      // Check parent exists if specified
      if (record.parent_id && !idMap.has(record.parent_id)) {
        errors.push(`Category ${record.external_id} references non-existent parent ${record.parent_id}`);
      }
      
      // Check level consistency
      if (record.parent_id) {
        const parent = idMap.get(record.parent_id);
        if (parent && record.level !== parent.level + 1) {
          errors.push(`Category ${record.external_id} level ${record.level} inconsistent with parent level ${parent.level}`);
        }
      } else if (record.level !== 1) {
        errors.push(`Top-level category ${record.external_id} should have level 1, got ${record.level}`);
      }
      
      // Check path consistency
      const pathParts = record.category_path.split(' > ');
      if (pathParts.length !== record.level) {
        errors.push(`Category ${record.external_id} path depth ${pathParts.length} doesn't match level ${record.level}`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate TSV format
   */
  static validateTSVFormat(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      errors.push('TSV file is empty');
      return { isValid: false, errors };
    }
    
    for (let i = 0; i < Math.min(lines.length, 100); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split('\t');
      if (parts.length !== 2) {
        errors.push(`Line ${i + 1}: Expected 2 tab-separated columns, got ${parts.length}`);
        continue;
      }
      
      const [idStr, categoryPath] = parts;
      if (isNaN(parseInt(idStr))) {
        errors.push(`Line ${i + 1}: Invalid ID "${idStr}"`);
      }
      
      if (!categoryPath || categoryPath.length === 0) {
        errors.push(`Line ${i + 1}: Empty category path`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```

### 7. Taskfile Commands
- [ ] Update: `tasks/Taskfile.database.yml`

```yaml
# Add to tasks/Taskfile.database.yml

taxonomy:import:
  desc: Import external product taxonomy from URL
  cmds:
    - echo "Starting taxonomy import..."
    - curl -X POST http://localhost:3000/api/admin/taxonomy/import \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_TOKEN" \
        -d '{"sourceUrl": "{{.URL}}"}'
  requires:
    vars: [URL, SUPABASE_TOKEN]

taxonomy:stats:
  desc: Get taxonomy import statistics
  cmds:
    - curl -X GET http://localhost:3000/api/admin/taxonomy/import \
        -H "Authorization: Bearer $SUPABASE_TOKEN"
  requires:
    vars: [SUPABASE_TOKEN]
```

### 8. Implementation Checklist
- [ ] TaxonomyImporter class with TSV parsing
- [ ] API endpoint for admin import operations
- [ ] Admin UI for taxonomy management
- [ ] Import statistics and monitoring
- [ ] Data validation and error handling
- [ ] Taskfile commands for CLI operations
- [ ] Database indexes for performance
- [ ] Error logging and monitoring
- [ ] Import progress tracking
- [ ] Automatic backup before import
- [ ] Rollback functionality for failed imports
- [ ] Periodic update scheduling
- [ ] Import history tracking
- [ ] Performance optimization for large datasets
- [ ] Memory management for large imports 