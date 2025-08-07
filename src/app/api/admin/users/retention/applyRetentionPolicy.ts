import { createClient } from "@/common/supabase/server";

import type { RetentionPolicy, RetentionStats } from "./types";

export async function applyRetentionPolicy(
  policy: RetentionPolicy,
): Promise<RetentionStats> {
  try {
    const supabase = await createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    let query = supabase
      .from(policy.table)
      .select("*")
      .lt("created_at", cutoffDate.toISOString());

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

    if (policy.archiveBeforeDelete) {
      const { error: archiveError } = await supabase
        .from(`${policy.table}_archive`)
        .insert(expiredRecords);

      if (!archiveError) {
        archived = expiredRecords.length;
      }
    }

    const { error: deleteError } = await supabase
      .from(policy.table)
      .delete()
      .lt("created_at", cutoffDate.toISOString());

    if (!deleteError) {
      deleted = expiredRecords.length;
    }

    return { processed: expiredRecords.length, archived, deleted };
  } catch (error) {
    console.error(`Apply retention policy error for ${policy.table}:`, error);
    throw error;
  }
}
