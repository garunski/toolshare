import { createClient } from "@/common/supabase/server";

import { executeRetentionPolicies } from "./executeRetentionPolicies";
import type { RetentionResult } from "./types";

export async function scheduleRetentionCleanup(): Promise<
  RetentionResult<void>
> {
  try {
    const supabase = await createClient();
    const result = await executeRetentionPolicies();

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    await supabase.from("system_log").insert({
      type: "data_retention",
      message: `Retention cleanup completed: ${result.data?.processed} processed, ${result.data?.archived} archived, ${result.data?.deleted} deleted`,
      metadata: result.data,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Schedule retention cleanup error:", error);
    return {
      success: false,
      error: "Failed to schedule retention cleanup",
    };
  }
}
