import { type ToolCreationData } from "@/app/tools/tools/add/validation";
import { createClient } from "@/common/supabase/server";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"];

export interface ToolOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function processToolData(
  toolData: ToolCreationData,
): Promise<ToolOperationResult<Tool>> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Process tool data and create tool
    const { data, error } = await supabase
      .from("tools")
      .insert({
        ...toolData,
        owner_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Tool data processing error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Tool data processing error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error processing tool data",
    };
  }
}
