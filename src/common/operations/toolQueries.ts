import { supabase } from "@/common/supabase";
import { ToolSearchData } from "@/common/validators/toolCreationValidator";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"];

export interface ToolOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ToolQueries {
  static async getUserTools(
    userId: string,
  ): Promise<ToolOperationResult<Tool[]>> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("User tools fetch error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("User tools fetch error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error fetching user tools",
      };
    }
  }

  static async searchTools(
    searchData: ToolSearchData,
  ): Promise<ToolOperationResult<Tool[]>> {
    try {
      let query = supabase.from("tools").select("*");

      // Apply search filters
      if (searchData.query) {
        query = query.or(
          `name.ilike.%${searchData.query}%,description.ilike.%${searchData.query}%`,
        );
      }

      if (searchData.category) {
        query = query.eq("category", searchData.category);
      }

      if (searchData.condition) {
        query = query.eq("condition", searchData.condition);
      }

      if (searchData.is_available !== undefined) {
        query = query.eq("is_available", searchData.is_available);
      }

      if (searchData.owner_id) {
        query = query.eq("owner_id", searchData.owner_id);
      }

      // Only show available tools by default
      if (searchData.is_available === undefined) {
        query = query.eq("is_available", true);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Tool search error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Tool search error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error searching tools",
      };
    }
  }

  static async getAvailableTools(): Promise<ToolOperationResult<Tool[]>> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Available tools fetch error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Available tools fetch error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error fetching available tools",
      };
    }
  }
}
