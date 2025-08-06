import { createClient } from "@/common/supabase/client";

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
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("items").select("*").eq("owner_id", userId),
      supabase
        .from("loan_requests")
        .select("*")
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`),
      supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
      supabase.from("audit_log").select("*").eq("user_id", userId),
    ]);

    return {
      profile: profile.data,
      items: items.data || [],
      loans: loans.data || [],
      messages: messages.data || [],
      audit_log: auditLog.data || [],
    };
  }

  /**
   * Delete all user data (GDPR Article 17)
   */
  static async deleteUserData(
    userId: string,
    reason: string,
  ): Promise<{
    success: boolean;
    deletedTables: string[];
    errors: string[];
  }> {
    const supabase = createClient();
    const deletedTables: string[] = [];
    const errors: string[] = [];

    // Tables to clean up when user is deleted
    const tablesToClean = [
      "notifications",
      "saved_searches",
      "user_sessions",
      "user_preferences",
    ];

    // Archive user data before deletion
    try {
      const userData = await this.exportUserData(userId);
      await supabase.from("deleted_user_archive").insert({
        user_id: userId,
        deletion_reason: reason,
        user_data: userData,
        deleted_at: new Date().toISOString(),
      });
    } catch (error) {
      errors.push(
        `Failed to archive user data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Delete from each table
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

    // Anonymize data that must be retained
    try {
      await this.anonymizeRetainedData(userId);
    } catch (error) {
      errors.push(
        `Failed to anonymize retained data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      success: errors.length === 0,
      deletedTables,
      errors,
    };
  }

  /**
   * Anonymize data that must be retained for business purposes
   */
  private static async anonymizeRetainedData(userId: string): Promise<void> {
    const supabase = createClient();
    const anonymousId = `anonymous_${Date.now()}`;

    // Anonymize audit logs (keep for compliance but remove personal data)
    await supabase
      .from("audit_log")
      .update({ user_id: anonymousId })
      .eq("user_id", userId);

    // Anonymize search analytics
    await supabase
      .from("search_analytics")
      .update({ user_id: null })
      .eq("user_id", userId);
  }

  /**
   * Get data processing consent status
   */
  static async getConsentStatus(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
