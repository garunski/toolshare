import { createClient } from "@/common/supabase/client";

interface RetentionPolicy {
  table: string;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  conditions?: Record<string, any>;
}

export class DataRetentionManager {
  private static readonly policies: RetentionPolicy[] = [
    { table: "audit_log", retentionDays: 2555, archiveBeforeDelete: true }, // 7 years
    {
      table: "search_analytics",
      retentionDays: 365,
      archiveBeforeDelete: false,
    }, // 1 year
    { table: "activity_log", retentionDays: 90, archiveBeforeDelete: false }, // 3 months
    {
      table: "notifications",
      retentionDays: 30,
      archiveBeforeDelete: false,
      conditions: { read: true },
    },
  ];

  /**
   * Execute data retention policies
   */
  static async executeRetentionPolicies(): Promise<{
    processed: number;
    archived: number;
    deleted: number;
  }> {
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
        console.error(
          `Failed to apply retention policy for ${policy.table}:`,
          error,
        );
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
      .select("*")
      .lt("created_at", cutoffDate.toISOString());

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
      .lt("created_at", cutoffDate.toISOString());

    if (!deleteError) {
      deleted = expiredRecords.length;
    }

    return { processed: expiredRecords.length, archived, deleted };
  }

  /**
   * Schedule automatic retention cleanup
   */
  static async scheduleRetentionCleanup(): Promise<void> {
    const supabase = createClient();
    const result = await this.executeRetentionPolicies();

    // Log retention activity
    await supabase.from("system_log").insert({
      type: "data_retention",
      message: `Retention cleanup completed: ${result.processed} processed, ${result.archived} archived, ${result.deleted} deleted`,
      metadata: result,
      created_at: new Date().toISOString(),
    });
  }
}
