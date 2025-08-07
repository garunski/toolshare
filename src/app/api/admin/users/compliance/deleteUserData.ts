import { createClient } from "@/common/supabase/server";

import { exportUserData } from "./exportUserData";
import type { DataDeletionResult, GDPRResult } from "./types";

export async function deleteUserData(
  userId: string,
  reason: string,
): Promise<GDPRResult<DataDeletionResult>> {
  try {
    const supabase = await createClient();
    const deletedTables: string[] = [];
    const errors: string[] = [];

    try {
      const userDataResult = await exportUserData(userId);
      if (userDataResult.success && userDataResult.data) {
        await supabase.from("deleted_user_archive").insert({
          user_id: userId,
          deletion_reason: reason,
          user_data: userDataResult.data,
          deleted_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      errors.push(
        `Failed to archive user data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const tablesToClean = [
      "notifications",
      "saved_searches",
      "user_sessions",
      "user_preferences",
    ];
    for (const table of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", userId);
        if (error) {
          errors.push(`Failed to delete from ${table}: ${error.message}`);
        } else {
          deletedTables.push(table);
        }
      } catch (error) {
        errors.push(
          `Error deleting from ${table}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    try {
      const anonymousId = `anonymous_${Date.now()}`;
      await supabase
        .from("audit_log")
        .update({ user_id: anonymousId })
        .eq("user_id", userId);
      await supabase
        .from("search_analytics")
        .update({ user_id: null })
        .eq("user_id", userId);
    } catch (error) {
      errors.push(
        `Failed to anonymize retained data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      success: true,
      data: {
        success: errors.length === 0,
        deletedTables,
        errors,
      },
    };
  } catch (error) {
    console.error("Delete user data error:", error);
    return {
      success: false,
      error: "Failed to delete user data",
    };
  }
}
