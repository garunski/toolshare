import { supabase } from "@/common/supabase";

export function buildSearchQuery(filters: any) {
  let query = supabase.from("tools").select(`
    id,
    name,
    description,
    category,
    condition,
    images,
    is_available,
    created_at,
    profiles!tools_owner_id_fkey (
      id,
      first_name,
      last_name
    )
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

  return query;
}

export async function fetchCategories() {
  const { data, error } = await supabase.from("tools").select("category");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Extract unique categories
  const categories = [
    ...new Set(data?.map((tool: any) => tool.category).filter(Boolean)),
  ] as string[];
  return categories.sort();
}

export async function fetchConditions() {
  const { data, error } = await supabase.from("tools").select("condition");

  if (error) {
    console.error("Error fetching conditions:", error);
    return [];
  }

  // Extract unique conditions
  const conditions = [
    ...new Set(data?.map((tool: any) => tool.condition).filter(Boolean)),
  ] as string[];
  return conditions.sort();
}

export function calculateSearchScore(tool: any, searchTerm: string): number {
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

export function sortSearchResults(results: any[], searchTerm: string): any[] {
  if (!searchTerm) return results;

  return results
    .map((tool) => ({
      ...tool,
      searchScore: calculateSearchScore(tool, searchTerm),
    }))
    .sort((a, b) => b.searchScore - a.searchScore);
}
