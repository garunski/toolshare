import { createClient } from "@/common/supabase/client";
import {
  ToolCreationData,
  ToolUpdateData,
} from "@/common/validators/toolCreationValidator";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"];
type ToolInsert = Database["public"]["Tables"]["tools"]["Insert"];
type ToolUpdate = Database["public"]["Tables"]["tools"]["Update"];

export interface ToolOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ToolCRUD {
  static async createTool(
    toolData: ToolCreationData,
    ownerId: string,
  ): Promise<ToolOperationResult<Tool>> {
    try {
      const insertData: ToolInsert = {
        name: toolData.name,
        description: toolData.description,
        category: toolData.category,
        condition: toolData.condition,
        is_available: toolData.is_available,
        images: toolData.images || [],
        owner_id: ownerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const supabase = createClient();
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
          error instanceof Error
            ? error.message
            : "Unknown error creating tool",
      };
    }
  }

  static async updateTool(
    toolId: string,
    updateData: ToolUpdateData,
  ): Promise<ToolOperationResult<Tool>> {
    try {
      const updatePayload: ToolUpdate = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const supabase = createClient();
      const { data, error } = await supabase
        .from("tools")
        .update(updatePayload)
        .eq("id", toolId)
        .select()
        .single();

      if (error) {
        console.error("Tool update error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Tool update error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error updating tool",
      };
    }
  }

  static async deleteTool(toolId: string): Promise<ToolOperationResult> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("tools").delete().eq("id", toolId);

      if (error) {
        console.error("Tool deletion error:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Tool deletion error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error deleting tool",
      };
    }
  }

  static async getToolById(toolId: string): Promise<ToolOperationResult<Tool>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", toolId)
        .single();

      if (error) {
        console.error("Tool fetch error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Tool fetch error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error fetching tool",
      };
    }
  }
}
