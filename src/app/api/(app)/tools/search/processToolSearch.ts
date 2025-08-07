import { createClient } from "@/common/supabase/server";

export interface SearchFilters {
  category?: string;
  condition?: string;
  availability?: "all" | "available" | "unavailable";
  searchTerm?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  condition: string | null;
  images: string[] | null;
  is_available: boolean;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
  };
  distance?: number;
}

export async function processToolSearch(
  filters: SearchFilters,
): Promise<SearchResult[]> {
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
        owner_id,
        profiles!inner(
          id,
          first_name,
          last_name
        )
      `);

    // Apply filters
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.condition) {
      query = query.eq("condition", filters.condition);
    }

    if (filters.availability === "available") {
      query = query.eq("is_available", true);
    } else if (filters.availability === "unavailable") {
      query = query.eq("is_available", false);
    }

    if (filters.searchTerm) {
      query = query.or(
        `name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Tool search error:", error);
      return [];
    }

    // Transform the data to match SearchResult interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      condition: item.condition,
      images: item.images,
      is_available: item.is_available,
      owner: {
        id: item.profiles?.id || item.owner_id,
        first_name: item.profiles?.first_name || "Unknown",
        last_name: item.profiles?.last_name || "User",
      },
    }));
  } catch (error) {
    console.error("Tool search processing error:", error);
    return [];
  }
}
