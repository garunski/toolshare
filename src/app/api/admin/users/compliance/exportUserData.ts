import { createClient } from "@/common/supabase/server";

import type { GDPRResult, UserDataExport } from "./types";

export async function exportUserData(
  userId: string,
): Promise<GDPRResult<UserDataExport>> {
  try {
    const supabase = await createClient();
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
      success: true,
      data: {
        profile: profile.data,
        items: items.data || [],
        loans: loans.data || [],
        messages: messages.data || [],
        audit_log: auditLog.data || [],
      },
    };
  } catch (error) {
    console.error("Export user data error:", error);
    return {
      success: false,
      error: "Failed to export user data",
    };
  }
}
