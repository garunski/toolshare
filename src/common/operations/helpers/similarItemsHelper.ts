import { createClient } from "@/common/supabase/client";

/**
 * Find similar items in the same category
 */
export async function findSimilarItems(
  categoryId: number,
  itemContext: { name: string; description?: string },
): Promise<any[]> {
  const supabase = createClient();

  // Search for items with similar names or descriptions
  const searchTerms = [
    ...itemContext.name.toLowerCase().split(/\s+/),
    ...(itemContext.description?.toLowerCase().split(/\s+/) || []),
  ].filter((term) => term.length > 2);

  if (searchTerms.length === 0) return [];

  const searchQuery = searchTerms.join(" | ");

  const { data: similarItems } = await supabase
    .from("items")
    .select("name, description, attributes, condition, location")
    .eq("external_category_id", categoryId)
    .textSearch("name", searchQuery)
    .limit(10);

  return similarItems || [];
}
