import {
  buildSearchQuery,
  fetchCategories,
  fetchConditions,
  sortSearchResults,
} from "./toolSearchHelpers";

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
  const query = buildSearchQuery(filters);
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to search tools: ${error.message}`);
  }

  const results = (data || []).map((item) => ({
    ...item,
    owner: item.profiles[0],
  }));

  return sortSearchResults(results, filters.searchTerm || "");
}

export async function getToolCategories(): Promise<string[]> {
  return await fetchCategories();
}

export async function getToolConditions(): Promise<string[]> {
  return await fetchConditions();
}
