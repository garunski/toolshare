import { createClient } from "@/common/supabase/client";

/**
 * Process category facets
 */
export function processCategoryFacets(data: any[]) {
  const categoryCounts = new Map<number, number>();
  const categoryNames = new Map<number, string>();

  data.forEach((item) => {
    if (item.external_category_id) {
      const count = categoryCounts.get(item.external_category_id) || 0;
      categoryCounts.set(item.external_category_id, count + 1);
      if (item.external_product_taxonomy?.category_path) {
        categoryNames.set(
          item.external_category_id,
          item.external_product_taxonomy.category_path,
        );
      }
    }
  });

  return Array.from(categoryCounts.entries()).map(([id, count]) => ({
    id,
    name: categoryNames.get(id) || `Category ${id}`,
    count,
  }));
}

/**
 * Process condition facets
 */
export function processConditionFacets(data: any[]) {
  const conditionCounts = new Map<string, number>();

  data.forEach((item) => {
    if (item.condition) {
      const count = conditionCounts.get(item.condition) || 0;
      conditionCounts.set(item.condition, count + 1);
    }
  });

  return Array.from(conditionCounts.entries()).map(([value, count]) => ({
    value,
    count,
  }));
}

/**
 * Process location facets
 */
export function processLocationFacets(data: any[]) {
  const locationCounts = new Map<string, number>();

  data.forEach((item) => {
    if (item.location) {
      const count = locationCounts.get(item.location) || 0;
      locationCounts.set(item.location, count + 1);
    }
  });

  return Array.from(locationCounts.entries()).map(([value, count]) => ({
    value,
    count,
  }));
}

/**
 * Get sort column for ordering
 */
export function getSortColumn(sortBy: string): string {
  switch (sortBy) {
    case "date":
      return "created_at";
    case "name":
      return "name";
    case "condition":
      return "condition";
    case "location":
      return "location";
    default:
      return "created_at";
  }
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const supabase = createClient();
  const words = query
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);
  if (words.length === 0) return [];

  // Get suggestions from item names
  const { data } = await supabase
    .from("items")
    .select("name")
    .textSearch("name", words[0])
    .limit(5);

  const suggestions = (data || [])
    .map((item) => item.name.toLowerCase())
    .filter((name) => name.includes(words[0]) && name !== query.toLowerCase());

  return Array.from(new Set(suggestions)).slice(0, 3);
}
