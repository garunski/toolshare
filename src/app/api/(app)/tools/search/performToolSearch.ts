import { createClient } from "@/common/supabase/server";
import type { Tool } from "@/types/tool";

export interface SearchFilters {
  searchTerm?: string;
  category?: string;
  condition?: string;
  availability?: boolean;
}

export interface ToolWithOwner extends Tool {
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface ToolSearchResult extends ToolWithOwner {
  searchScore?: number;
}

export async function performToolSearch(
  filters: SearchFilters,
): Promise<ToolSearchResult[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("tools").select(`
      id,
      name,
      description,
      category,
      condition,
      images,
      is_available,
      location,
      owner_id,
      created_at,
      updated_at
    `);

    // Apply filters
    if (filters.searchTerm) {
      query = query.or(
        `name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`,
      );
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.condition) {
      query = query.eq("condition", filters.condition);
    }

    if (filters.availability !== undefined) {
      query = query.eq("is_available", filters.availability);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Tool search error:", error);
      return [];
    }

    const results = data || [];

    // Apply search scoring and sorting if search term provided
    if (filters.searchTerm) {
      return results
        .map((tool) => ({
          ...tool,
          searchScore: calculateSearchScore(tool, filters.searchTerm!),
        }))
        .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
    }

    return results;
  } catch (error) {
    console.error("Tool search error:", error);
    return [];
  }
}

export async function fetchToolCategories(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tools").select("category");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    const categories = [
      ...new Set(
        data
          ?.map((tool: Pick<Tool, "category">) => tool.category)
          .filter(Boolean),
      ),
    ] as string[];
    return categories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

function calculateSearchScore(tool: ToolWithOwner, searchTerm: string): number {
  if (!searchTerm) return 0;

  const term = searchTerm.toLowerCase();
  const name = tool.name?.toLowerCase() || "";
  const description = tool.description?.toLowerCase() || "";
  const category = tool.category?.toLowerCase() || "";

  let score = 0;

  // Exact matches get highest score
  if (name.includes(term)) score += 10;
  if (description.includes(term)) score += 5;
  if (category.includes(term)) score += 3;

  // Partial matches
  const words = term.split(" ");
  words.forEach((word) => {
    if (name.includes(word)) score += 2;
    if (description.includes(word)) score += 1;
    if (category.includes(word)) score += 1;
  });

  return score;
}
