# Category Import Engine

## Data Quality and Processing System

### 1. Import Validation Engine
- [ ] Create: `src/common/operations/importValidationEngine.ts` (under 150 lines)

```typescript
// src/common/operations/importValidationEngine.ts
import { createClient } from '@/common/supabase/client';
import { TaxonomyValidator, type TaxonomyRecord } from '@/common/validators/taxonomyValidator';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicates: number[];
  orphans: number[];
  stats: {
    totalRecords: number;
    validRecords: number;
    topLevelCategories: number;
    maxDepth: number;
  };
}

export class ImportValidationEngine {
  
  /**
   * Comprehensive validation of taxonomy data
   */
  static async validateImportData(records: TaxonomyRecord[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const duplicates: number[] = [];
    const orphans: number[] = [];
    
    // Check for duplicates
    const idCounts = new Map<number, number>();
    records.forEach(record => {
      const count = idCounts.get(record.external_id) || 0;
      idCounts.set(record.external_id, count + 1);
    });
    
    idCounts.forEach((count, id) => {
      if (count > 1) {
        duplicates.push(id);
        errors.push(`Duplicate external_id found: ${id} (appears ${count} times)`);
      }
    });
    
    // Check hierarchy integrity
    const hierarchyValidation = TaxonomyValidator.validateHierarchy(records);
    errors.push(...hierarchyValidation.errors);
    
    // Find orphaned categories
    const validIds = new Set(records.map(r => r.external_id));
    records.forEach(record => {
      if (record.parent_id && !validIds.has(record.parent_id)) {
        orphans.push(record.external_id);
        warnings.push(`Category ${record.external_id} references missing parent ${record.parent_id}`);
      }
    });
    
    // Check against existing data
    const existingConflicts = await this.checkExistingConflicts(records);
    warnings.push(...existingConflicts);
    
    // Generate statistics
    const validRecords = records.filter(r => !duplicates.includes(r.external_id));
    const topLevelCategories = validRecords.filter(r => r.level === 1).length;
    const maxDepth = Math.max(...validRecords.map(r => r.level));
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      duplicates,
      orphans,
      stats: {
        totalRecords: records.length,
        validRecords: validRecords.length,
        topLevelCategories,
        maxDepth
      }
    };
  }

  /**
   * Check for conflicts with existing data
   */
  private static async checkExistingConflicts(records: TaxonomyRecord[]): Promise<string[]> {
    const supabase = createClient();
    const warnings: string[] = [];
    
    const { data: existingCategories } = await supabase
      .from('external_product_taxonomy')
      .select('external_id, category_path')
      .in('external_id', records.map(r => r.external_id));
    
    if (!existingCategories) return warnings;
    
    const existingMap = new Map(existingCategories.map(cat => [cat.external_id, cat.category_path]));
    
    records.forEach(record => {
      const existing = existingMap.get(record.external_id);
      if (existing && existing !== record.category_path) {
        warnings.push(`Category ${record.external_id} path changed: "${existing}" → "${record.category_path}"`);
      }
    });
    
    return warnings;
  }

  /**
   * Pre-import validation report
   */
  static async generateValidationReport(records: TaxonomyRecord[]): Promise<{
    canProceed: boolean;
    summary: string;
    details: ValidationResult;
  }> {
    const validation = await this.validateImportData(records);
    
    const canProceed = validation.isValid && validation.duplicates.length === 0;
    const summary = `${validation.stats.validRecords}/${validation.stats.totalRecords} records valid. ` +
                   `${validation.errors.length} errors, ${validation.warnings.length} warnings.`;
    
    return {
      canProceed,
      summary,
      details: validation
    };
  }
}
```

### 2. Import Processing Engine
- [ ] Create: `src/common/operations/importProcessingEngine.ts` (under 150 lines)

```typescript
// src/common/operations/importProcessingEngine.ts
import { createClient } from '@/common/supabase/client';
import { ImportValidationEngine } from './importValidationEngine';
import type { TaxonomyRecord } from '@/common/validators/taxonomyValidator';

interface ProcessingOptions {
  batchSize: number;
  validateBeforeImport: boolean;
  createBackup: boolean;
  updateExisting: boolean;
}

interface ProcessingResult {
  success: boolean;
  processed: number;
  inserted: number;
  updated: number;
  errors: string[];
  backupId?: string;
}

export class ImportProcessingEngine {
  
  /**
   * Process and import taxonomy records
   */
  static async processImport(
    records: TaxonomyRecord[], 
    options: ProcessingOptions = {
      batchSize: 1000,
      validateBeforeImport: true,
      createBackup: true,
      updateExisting: true
    }
  ): Promise<ProcessingResult> {
    
    const result: ProcessingResult = {
      success: false,
      processed: 0,
      inserted: 0,
      updated: 0,
      errors: []
    };
    
    try {
      // Pre-import validation
      if (options.validateBeforeImport) {
        const validation = await ImportValidationEngine.validateImportData(records);
        if (!validation.isValid) {
          result.errors.push(...validation.errors);
          return result;
        }
      }
      
      // Create backup if requested
      if (options.createBackup) {
        result.backupId = await this.createBackup();
      }
      
      // Process in batches
      const batches = this.createBatches(records, options.batchSize);
      
      for (const batch of batches) {
        const batchResult = await this.processBatch(batch, options.updateExisting);
        result.processed += batch.length;
        result.inserted += batchResult.inserted;
        result.updated += batchResult.updated;
        
        if (batchResult.errors.length > 0) {
          result.errors.push(...batchResult.errors);
        }
      }
      
      result.success = result.errors.length === 0;
      
      // Update import log
      await this.logImportResult(result);
      
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Create backup of existing taxonomy
   */
  private static async createBackup(): Promise<string> {
    const supabase = createClient();
    const backupId = `backup_${Date.now()}`;
    
    const { error } = await supabase.rpc('create_taxonomy_backup', {
      backup_name: backupId
    });
    
    if (error) {
      throw new Error(`Backup creation failed: ${error.message}`);
    }
    
    return backupId;
  }

  /**
   * Split records into processing batches
   */
  private static createBatches(records: TaxonomyRecord[], batchSize: number): TaxonomyRecord[][] {
    const batches: TaxonomyRecord[][] = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Process single batch of records
   */
  private static async processBatch(
    batch: TaxonomyRecord[], 
    updateExisting: boolean
  ): Promise<{ inserted: number; updated: number; errors: string[] }> {
    
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;
    
    if (updateExisting) {
      // Upsert records
      const { error } = await supabase
        .from('external_product_taxonomy')
        .upsert(batch.map(record => ({
          external_id: record.external_id,
          category_path: record.category_path,
          parent_id: record.parent_id,
          level: record.level,
          is_active: true,
          last_updated: new Date().toISOString()
        })));
      
      if (error) {
        errors.push(`Batch upsert failed: ${error.message}`);
      } else {
        // Count insertions vs updates (simplified)
        inserted = batch.length;
      }
    } else {
      // Insert only new records
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
        errors.push(`Batch insert failed: ${error.message}`);
      } else {
        inserted = batch.length;
      }
    }
    
    return { inserted, updated, errors };
  }

  /**
   * Log import results
   */
  private static async logImportResult(result: ProcessingResult): Promise<void> {
    await supabase
      .from('import_log')
      .insert({
        import_type: 'external_taxonomy',
        source: 'tsv_file',
        processed_count: result.processed,
        success_count: result.inserted + result.updated,
        error_count: result.errors.length,
        errors: result.errors,
        backup_id: result.backupId,
        completed_at: new Date().toISOString()
      });
  }
}
```

### 3. Quality Scoring System
- [ ] Create: `src/common/operations/taxonomyQualityScorer.ts` (under 150 lines)

```typescript
// src/common/operations/taxonomyQualityScorer.ts
import { createClient } from '@/common/supabase/client';

interface QualityScore {
  overall: number;
  completeness: number;
  consistency: number;
  structure: number;
  details: {
    totalCategories: number;
    categoriesWithIssues: number;
    orphanedCategories: number;
    duplicatePaths: number;
    inconsistentLevels: number;
  };
  recommendations: string[];
}

export class TaxonomyQualityScorer {
  
  /**
   * Generate comprehensive quality score
   */
  static async generateQualityScore(): Promise<QualityScore> {
    const supabase = createClient();
    const { data: categories } = await supabase
      .from('external_product_taxonomy')
      .select('*')
      .eq('is_active', true);
    
    if (!categories || categories.length === 0) {
      return this.getEmptyScore();
    }
    
    const details = await this.analyzeQualityMetrics(categories);
    const scores = this.calculateScores(details);
    const recommendations = this.generateRecommendations(details);
    
    return {
      overall: Math.round((scores.completeness + scores.consistency + scores.structure) / 3),
      completeness: scores.completeness,
      consistency: scores.consistency,
      structure: scores.structure,
      details,
      recommendations
    };
  }

  /**
   * Analyze quality metrics
   */
  private static async analyzeQualityMetrics(categories: any[]) {
    const totalCategories = categories.length;
    let categoriesWithIssues = 0;
    let orphanedCategories = 0;
    let duplicatePaths = 0;
    let inconsistentLevels = 0;
    
    const idMap = new Map(categories.map(cat => [cat.external_id, cat]));
    const pathCounts = new Map<string, number>();
    
    categories.forEach(category => {
      // Count path duplicates
      const pathCount = pathCounts.get(category.category_path) || 0;
      pathCounts.set(category.category_path, pathCount + 1);
      
      let hasIssues = false;
      
      // Check for orphaned categories
      if (category.parent_id && !idMap.has(category.parent_id)) {
        orphanedCategories++;
        hasIssues = true;
      }
      
      // Check level consistency
      const pathParts = category.category_path.split(' > ');
      if (pathParts.length !== category.level) {
        inconsistentLevels++;
        hasIssues = true;
      }
      
      if (hasIssues) {
        categoriesWithIssues++;
      }
    });
    
    // Count duplicate paths
    pathCounts.forEach(count => {
      if (count > 1) {
        duplicatePaths++;
      }
    });
    
    return {
      totalCategories,
      categoriesWithIssues,
      orphanedCategories,
      duplicatePaths,
      inconsistentLevels
    };
  }

  /**
   * Calculate quality scores
   */
  private static calculateScores(details: any) {
    const completeness = details.totalCategories > 1000 ? 100 : Math.round((details.totalCategories / 1000) * 100);
    
    const issueRate = details.categoriesWithIssues / details.totalCategories;
    const consistency = Math.max(0, Math.round((1 - issueRate) * 100));
    
    const structuralIssues = details.orphanedCategories + details.duplicatePaths + details.inconsistentLevels;
    const structuralRate = structuralIssues / details.totalCategories;
    const structure = Math.max(0, Math.round((1 - structuralRate) * 100));
    
    return { completeness, consistency, structure };
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(details: any): string[] {
    const recommendations: string[] = [];
    
    if (details.totalCategories < 1000) {
      recommendations.push(`Import more categories (${details.totalCategories}/1000+ recommended)`);
    }
    
    if (details.orphanedCategories > 0) {
      recommendations.push(`Fix ${details.orphanedCategories} orphaned categories`);
    }
    
    if (details.duplicatePaths > 0) {
      recommendations.push(`Resolve ${details.duplicatePaths} duplicate category paths`);
    }
    
    if (details.inconsistentLevels > 0) {
      recommendations.push(`Fix ${details.inconsistentLevels} categories with inconsistent levels`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Taxonomy quality is excellent! Consider periodic updates to maintain currency.');
    }
    
    return recommendations;
  }

  /**
   * Empty score template
   */
  private static getEmptyScore(): QualityScore {
    return {
      overall: 0,
      completeness: 0,
      consistency: 0,
      structure: 0,
      details: {
        totalCategories: 0,
        categoriesWithIssues: 0,
        orphanedCategories: 0,
        duplicatePaths: 0,
        inconsistentLevels: 0
      },
      recommendations: ['Import external taxonomy to begin quality analysis']
    };
  }
}
```

### 2. Import Progress Tracker
- [ ] Create: `src/common/operations/importProgressTracker.ts` (under 150 lines)

```typescript
// src/common/operations/importProgressTracker.ts
import { createClient } from '@/common/supabase/client';

interface ImportProgress {
  id: string;
  stage: 'parsing' | 'validating' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentBatch: number;
  totalBatches: number;
  processed: number;
  total: number;
  startedAt: string;
  estimatedCompletion?: string;
  errors: string[];
}

export class ImportProgressTracker {
  
  /**
   * Create new import session
   */
  static async createImportSession(totalRecords: number): Promise<string> {
    const supabase = createClient();
    const sessionId = `import_${Date.now()}`;
    
    await supabase
      .from('import_sessions')
      .insert({
        id: sessionId,
        stage: 'parsing',
        progress: 0,
        total: totalRecords,
        processed: 0,
        started_at: new Date().toISOString(),
        errors: []
      });
    
    return sessionId;
  }

  /**
   * Update import progress
   */
  static async updateProgress(
    sessionId: string,
    updates: Partial<ImportProgress>
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.stage) updateData.stage = updates.stage;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.currentBatch !== undefined) updateData.current_batch = updates.currentBatch;
    if (updates.totalBatches !== undefined) updateData.total_batches = updates.totalBatches;
    if (updates.processed !== undefined) updateData.processed = updates.processed;
    if (updates.errors) updateData.errors = updates.errors;
    
    // Calculate estimated completion
    if (updates.progress && updates.progress > 0) {
      const elapsedMs = Date.now() - new Date(updates.startedAt || Date.now()).getTime();
      const estimatedTotalMs = elapsedMs / (updates.progress / 100);
      const remainingMs = estimatedTotalMs - elapsedMs;
      
      if (remainingMs > 0) {
        updateData.estimated_completion = new Date(Date.now() + remainingMs).toISOString();
      }
    }
    
    const supabase = createClient();
    await supabase
      .from('import_sessions')
      .update(updateData)
      .eq('id', sessionId);
  }

  /**
   * Get current progress
   */
  static async getProgress(sessionId: string): Promise<ImportProgress | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('import_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      stage: data.stage,
      progress: data.progress,
      currentBatch: data.current_batch || 0,
      totalBatches: data.total_batches || 0,
      processed: data.processed,
      total: data.total,
      startedAt: data.started_at,
      estimatedCompletion: data.estimated_completion,
      errors: data.errors || []
    };
  }

  /**
   * Complete import session
   */
  static async completeImport(sessionId: string, success: boolean, finalErrors: string[] = []): Promise<void> {
    await supabase
      .from('import_sessions')
      .update({
        stage: success ? 'completed' : 'failed',
        progress: 100,
        completed_at: new Date().toISOString(),
        errors: finalErrors
      })
      .eq('id', sessionId);
  }

  /**
   * Get import history
   */
  static async getImportHistory(limit = 10): Promise<ImportProgress[]> {
    const { data } = await supabase
      .from('import_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);
    
    return data || [];
  }
}
```

### 3. Backup and Recovery System
- [ ] Create: `src/common/operations/taxonomyBackupSystem.ts` (under 150 lines)

```typescript
// src/common/operations/taxonomyBackupSystem.ts
import { createClient } from '@/common/supabase/client';

interface BackupInfo {
  id: string;
  name: string;
  createdAt: string;
  recordCount: number;
  size: number;
  description?: string;
}

export class TaxonomyBackupSystem {
  
  /**
   * Create backup of current taxonomy
   */
  static async createBackup(name?: string, description?: string): Promise<string> {
    const supabase = createClient();
    const backupId = name || `backup_${Date.now()}`;
    
    // Create backup table
    const { error: createError } = await supabase.rpc('create_taxonomy_backup_table', {
      backup_name: backupId
    });
    
    if (createError) {
      throw new Error(`Failed to create backup: ${createError.message}`);
    }
    
    // Copy current data
    const { error: copyError } = await supabase.rpc('copy_taxonomy_to_backup', {
      backup_name: backupId
    });
    
    if (copyError) {
      throw new Error(`Failed to copy data: ${copyError.message}`);
    }
    
    // Log backup creation
    const { data: countData } = await supabase
      .from('external_product_taxonomy')
      .select('external_id', { count: 'exact' });
    
    await supabase
      .from('taxonomy_backups')
      .insert({
        id: backupId,
        name: backupId,
        description: description || 'Automatic backup before import',
        record_count: countData?.length || 0,
        created_at: new Date().toISOString()
      });
    
    return backupId;
  }

  /**
   * Restore from backup
   */
  static async restoreFromBackup(backupId: string): Promise<{ success: boolean; restored: number; errors: string[] }> {
    const supabase = createClient();
    const errors: string[] = [];
    
    try {
      // Verify backup exists
      const { data: backup } = await supabase
        .from('taxonomy_backups')
        .select('*')
        .eq('id', backupId)
        .single();
      
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`);
      }
      
      // Clear current data
      await supabase.from('external_product_taxonomy').delete().neq('external_id', 0);
      
      // Restore from backup
      const { error: restoreError } = await supabase.rpc('restore_taxonomy_from_backup', {
        backup_name: backupId
      });
      
      if (restoreError) {
        errors.push(`Restore failed: ${restoreError.message}`);
        return { success: false, restored: 0, errors };
      }
      
      return { success: true, restored: backup.record_count, errors: [] };
      
    } catch (error) {
      errors.push(error.message);
      return { success: false, restored: 0, errors };
    }
  }

  /**
   * List available backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    const { data, error } = await supabase
      .from('taxonomy_backups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map(backup => ({
      id: backup.id,
      name: backup.name,
      createdAt: backup.created_at,
      recordCount: backup.record_count,
      size: backup.size || 0,
      description: backup.description
    }));
  }

  /**
   * Delete backup
   */
  static async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Drop backup table
      await supabase.rpc('drop_taxonomy_backup_table', {
        backup_name: backupId
      });
      
      // Remove from backup log
      await supabase
        .from('taxonomy_backups')
        .delete()
        .eq('id', backupId);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### 4. Implementation Checklist
- [ ] Import validation engine with comprehensive error checking
- [ ] Processing engine with batch handling and progress tracking
- [ ] Quality scoring system with automated recommendations
- [ ] Backup and recovery system for safe imports
- [ ] Progress tracking for long-running imports
- [ ] Error logging and detailed reporting
- [ ] Batch processing for large datasets
- [ ] Memory optimization for efficient imports
- [ ] Rollback functionality for failed imports
- [ ] Import history and audit trail
- [ ] Automated quality assessments
- [ ] Performance monitoring during imports
- [ ] Data integrity verification
- [ ] Conflict resolution strategies
- [ ] Update detection and incremental imports 