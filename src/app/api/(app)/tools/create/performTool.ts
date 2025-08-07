import { createClient } from "@/common/supabase/server";
import { ToolCreationData } from "@/common/validators/toolCreationValidator";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"];
type ToolInsert = Database["public"]["Tables"]["tools"]["Insert"];

export interface ToolOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function performTool(
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

    const insertData: ToolInsert = {
      name: toolData.name,
      description: toolData.description,
      category: toolData.category,
      condition: toolData.condition,
      is_available: toolData.is_available,
      images: toolData.images || [],
      owner_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tools")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Tool creation error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Tool creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error creating tool",
    };
  }
}
