import { applyRetentionPolicy } from "./applyRetentionPolicy";
import type { RetentionResult, RetentionStats } from "./types";
import { retentionPolicies } from "./types";

export async function executeRetentionPolicies(): Promise<
  RetentionResult<RetentionStats>
> {
  try {
    let processed = 0;
    let archived = 0;
    let deleted = 0;

    for (const policy of retentionPolicies) {
      try {
        const result = await applyRetentionPolicy(policy);
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

    return {
      success: true,
      data: { processed, archived, deleted },
    };
  } catch (error) {
    console.error("Execute retention policies error:", error);
    return {
      success: false,
      error: "Failed to execute retention policies",
    };
  }
}
