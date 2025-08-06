import { createClient } from "@/common/supabase/client";

interface SearchFilters {
  query?: string;
  categories?: number[];
  location?: string;
  condition?: string[];
  priceRange?: { min?: number; max?: number };
  availability?: boolean;
  owner?: string;
  tags?: string[];
  dateRange?: { start?: string; end?: string };
  sortBy?: "relevance" | "date" | "name" | "condition" | "location";
  sortOrder?: "asc" | "desc";
}

/**
 * Save search for user
 */
export async function saveSearch(
  userId: string,
  name: string,
  filters: SearchFilters,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("saved_searches").insert({
      user_id: userId,
      name,
      filters,
      created_at: new Date().toISOString(),
    });

    return error ? { success: false, error: error.message } : { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get saved searches for user
 */
export async function getSavedSearches(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Track search analytics
 */
export async function trackSearch(
  query: string,
  filters: SearchFilters,
  resultsCount: number,
  userId?: string,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("search_analytics").insert({
      query,
      filters,
      results_count: resultsCount,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to track search:", error);
  }
}
