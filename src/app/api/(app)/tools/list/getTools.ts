import { type ToolSearchData } from "@/app/tools/tools/add/validation";
import { createClient } from "@/common/supabase/server";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"];

export interface ToolOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getTools(
  filters?: ToolSearchData,
): Promise<ToolOperationResult<Tool[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from("tools").select("*");

    // Apply search filters
    if (filters?.query) {
      query = query.or(
        `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
      );
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.condition) {
      query = query.eq("condition", filters.condition);
    }

    if (filters?.is_available !== undefined) {
      query = query.eq("is_available", filters.is_available);
    }

    if (filters?.owner_id) {
      query = query.eq("owner_id", filters.owner_id);
    }

    // Only show available tools by default
    if (filters?.is_available === undefined) {
      query = query.eq("is_available", true);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Tool list fetch error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Tool list fetch error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error fetching tools",
    };
  }
}

export async function getUserTools(
  userId: string,
): Promise<ToolOperationResult<Tool[]>> {
  try {
    const supabase = await createClient();
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

export async function getAvailableTools(): Promise<
  ToolOperationResult<Tool[]>
> {
  try {
    const supabase = await createClient();
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
