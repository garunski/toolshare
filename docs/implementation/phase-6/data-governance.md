# Data Governance System

## Audit Logging, Data Retention, and Compliance

### 1. Audit Logging Service
- [ ] Create: `src/common/operations/auditLoggingService.ts` (under 150 lines)

```typescript
// src/common/operations/auditLoggingService.ts
import { createClient } from '@/common/supabase/client';

interface AuditLogEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  resource_type: 'item' | 'user' | 'category' | 'loan' | 'message';
  resource_id: string;
  user_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLoggingService {
  
  /**
   * Log user action
   */
  static async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = createClient();
      await supabase
        .from('audit_log')
        .insert({
          action: entry.action,
          resource_type: entry.resource_type,
          resource_id: entry.resource_id,
          user_id: entry.user_id,
          metadata: entry.metadata,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  /**
   * Get audit trail for resource
   */
  static async getAuditTrail(resourceType: string, resourceId: string, limit = 50) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('audit_log')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(userId: string, days = 30) {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('audit_log')
      .select('action, resource_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Export audit data for compliance
   */
  static async exportAuditData(filters: {
    startDate: string;
    endDate: string;
    userId?: string;
    resourceType?: string;
  }) {
    const supabase = createClient();
    let query = supabase
      .from('audit_log')
      .select('*')
      .gte('created_at', filters.startDate)
      .lte('created_at', filters.endDate);

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}
```

### 2. Data Retention Manager
- [ ] Create: `src/common/operations/dataRetentionManager.ts` (under 150 lines)

```typescript
// src/common/operations/dataRetentionManager.ts
import { createClient } from '@/common/supabase/client';

interface RetentionPolicy {
  table: string;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  conditions?: Record<string, any>;
}

export class DataRetentionManager {
  private static readonly policies: RetentionPolicy[] = [
    { table: 'audit_log', retentionDays: 2555, archiveBeforeDelete: true }, // 7 years
    { table: 'search_analytics', retentionDays: 365, archiveBeforeDelete: false }, // 1 year
    { table: 'activity_log', retentionDays: 90, archiveBeforeDelete: false }, // 3 months
    { table: 'notifications', retentionDays: 30, archiveBeforeDelete: false, conditions: { read: true } }
  ];

  /**
   * Execute data retention policies
   */
  static async executeRetentionPolicies(): Promise<{ processed: number; archived: number; deleted: number }> {
    let processed = 0;
    let archived = 0;
    let deleted = 0;

    for (const policy of this.policies) {
      try {
        const result = await this.applyRetentionPolicy(policy);
        processed += result.processed;
        archived += result.archived;
        deleted += result.deleted;
      } catch (error) {
        console.error(`Failed to apply retention policy for ${policy.table}:`, error);
      }
    }

    return { processed, archived, deleted };
  }

  /**
   * Apply single retention policy
   */
  private static async applyRetentionPolicy(policy: RetentionPolicy) {
    const supabase = createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    let query = supabase
      .from(policy.table)
      .select('*')
      .lt('created_at', cutoffDate.toISOString());

    // Apply additional conditions
    if (policy.conditions) {
      Object.entries(policy.conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data: expiredRecords, error } = await query;
    
    if (error) throw error;
    if (!expiredRecords || expiredRecords.length === 0) {
      return { processed: 0, archived: 0, deleted: 0 };
    }

    let archived = 0;
    let deleted = 0;

    // Archive if required
    if (policy.archiveBeforeDelete) {
      const { error: archiveError } = await supabase
        .from(`${policy.table}_archive`)
        .insert(expiredRecords);

      if (!archiveError) {
        archived = expiredRecords.length;
      }
    }

    // Delete expired records
    const { error: deleteError } = await supabase
      .from(policy.table)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (!deleteError) {
      deleted = expiredRecords.length;
    }

    return { processed: expiredRecords.length, archived, deleted };
  }

  /**
   * Schedule automatic retention cleanup
   */
  static async scheduleRetentionCleanup(): Promise<void> {
    // This would be called by a cron job or scheduled function
    const result = await this.executeRetentionPolicies();
    
    // Log retention activity
    await supabase
      .from('system_log')
      .insert({
        type: 'data_retention',
        message: `Retention cleanup completed: ${result.processed} processed, ${result.archived} archived, ${result.deleted} deleted`,
        metadata: result,
        created_at: new Date().toISOString()
      });
  }
}
```

### 3. GDPR Compliance Manager
- [ ] Create: `src/common/operations/gdprComplianceManager.ts` (under 150 lines)

```typescript
// src/common/operations/gdprComplianceManager.ts
import { createClient } from '@/common/supabase/client';

export class GDPRComplianceManager {
  
  /**
   * Export all user data (GDPR Article 15)
   */
  static async exportUserData(userId: string): Promise<{
    profile: any;
    items: any[];
    loans: any[];
    messages: any[];
    audit_log: any[];
  }> {
    const supabase = createClient();
    const [profile, items, loans, messages, auditLog] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('items').select('*').eq('owner_id', userId),
      supabase.from('loan_requests').select('*').or(`borrower_id.eq.${userId},lender_id.eq.${userId}`),
      supabase.from('messages').select('*').or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
      supabase.from('audit_log').select('*').eq('user_id', userId)
    ]);

    return {
      profile: profile.data,
      items: items.data || [],
      loans: loans.data || [],
      messages: messages.data || [],
      audit_log: auditLog.data || []
    };
  }

  /**
   * Delete all user data (GDPR Article 17)
   */
  static async deleteUserData(userId: string, reason: string): Promise<{
    success: boolean;
    deletedTables: string[];
    errors: string[];
  }> {
    const deletedTables: string[] = [];
    const errors: string[] = [];

    // Tables to clean up when user is deleted
    const tablesToClean = [
      'notifications',
      'saved_searches',
      'user_sessions',
      'user_preferences'
    ];

    // Archive user data before deletion
    try {
      const userData = await this.exportUserData(userId);
      await supabase
        .from('deleted_user_archive')
        .insert({
          user_id: userId,
          deletion_reason: reason,
          user_data: userData,
          deleted_at: new Date().toISOString()
        });
    } catch (error) {
      errors.push(`Failed to archive user data: ${error.message}`);
    }

    // Delete from each table
    for (const table of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          errors.push(`Failed to delete from ${table}: ${error.message}`);
        } else {
          deletedTables.push(table);
        }
      } catch (error) {
        errors.push(`Error deleting from ${table}: ${error.message}`);
      }
    }

    // Anonymize data that must be retained
    try {
      await this.anonymizeRetainedData(userId);
    } catch (error) {
      errors.push(`Failed to anonymize retained data: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      deletedTables,
      errors
    };
  }

  /**
   * Anonymize data that must be retained for business purposes
   */
  private static async anonymizeRetainedData(userId: string): Promise<void> {
    const anonymousId = `anonymous_${Date.now()}`;

    // Anonymize audit logs (keep for compliance but remove personal data)
    await supabase
      .from('audit_log')
      .update({ user_id: anonymousId })
      .eq('user_id', userId);

    // Anonymize search analytics
    await supabase
      .from('search_analytics')
      .update({ user_id: null })
      .eq('user_id', userId);
  }

  /**
   * Get data processing consent status
   */
  static async getConsentStatus(userId: string) {
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Record consent decision
   */
  static async recordConsent(
    userId: string,
    consentType: 'data_processing' | 'marketing' | 'analytics',
    granted: boolean
  ): Promise<void> {
    await supabase
      .from('user_consents')
      .insert({
        user_id: userId,
        consent_type: consentType,
        granted,
        granted_at: granted ? new Date().toISOString() : null,
        revoked_at: !granted ? new Date().toISOString() : null
      });
  }
}
```

### 4. Implementation Checklist
- [ ] Audit logging service with comprehensive tracking
- [ ] Data retention manager with automated cleanup
- [ ] GDPR compliance manager with export/delete capabilities
- [ ] Consent management system
- [ ] Data anonymization tools
- [ ] Retention policy configuration
- [ ] Compliance reporting and analytics
- [ ] Automated data lifecycle management
- [ ] Legal hold functionality for litigation
- [ ] Data classification and tagging
- [ ] Privacy impact assessment tools
- [ ] Cross-border data transfer compliance
- [ ] Incident response procedures
- [ ] Regular compliance audits
- [ ] Data breach notification system 