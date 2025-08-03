import {
  buildSearchQuery,
  fetchCategories,
  fetchConditions,
  sortSearchResults,
  type SearchFilters as BaseSearchFilters,
  type ToolWithOwner,
} from "./toolSearchOperations";

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

export async function searchTools(
  filters: SearchFilters,
): Promise<SearchResult[]> {
  // Convert availability filter to boolean for the base query
  const baseFilters: BaseSearchFilters = {
    searchTerm: filters.searchTerm,
    category: filters.category,
    condition: filters.condition,
    availability:
      filters.availability === "available"
        ? true
        : filters.availability === "unavailable"
          ? false
          : undefined,
  };

  const query = buildSearchQuery(baseFilters);
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to search tools: ${error.message}`);
  }

  const results = (data || []).map((item: any) => ({
    ...item,
    owner: item.profiles?.[0] || {
      id: item.owner_id,
      first_name: "Unknown",
      last_name: "User",
    },
  }));

  // Filter by availability if needed
  let filteredResults = results;
  if (filters.availability === "available") {
    filteredResults = results.filter((item: any) => item.is_available);
  } else if (filters.availability === "unavailable") {
    filteredResults = results.filter((item: any) => !item.is_available);
  }

  const sortedResults = sortSearchResults(
    filteredResults as ToolWithOwner[],
    filters.searchTerm || "",
  );
  return sortedResults.map((result) => ({
    ...result,
    owner: (result.profiles as any)?.[0] || {
      id: result.owner_id,
      first_name: "Unknown",
      last_name: "User",
    },
  })) as SearchResult[];
}

export async function getToolCategories(): Promise<string[]> {
  return await fetchCategories();
}

export async function getToolConditions(): Promise<string[]> {
  return await fetchConditions();
}
