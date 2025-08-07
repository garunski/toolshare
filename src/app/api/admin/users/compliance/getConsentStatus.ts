import { createClient } from "@/common/supabase/server";

import type { GDPRResult } from "./types";

export async function getConsentStatus(
  userId: string,
): Promise<GDPRResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get consent status error:", error);
    return {
      success: false,
      error: "Failed to get consent status",
    };
  }
}
