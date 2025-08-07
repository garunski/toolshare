import { createClient } from "@/common/supabase/server";

/**
 * Find similar items in the same category
 */
export async function findSimilarItems(
  categoryId: number,
  itemContext: { name: string; description?: string },
): Promise<any[]> {
  const supabase = await createClient();

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

/**
 * Calculate similarity score between items
 */
export function calculateSimilarity(
  item1: { name: string; description?: string },
  item2: { name: string; description?: string },
): number {
  const name1 = item1.name.toLowerCase();
  const name2 = item2.name.toLowerCase();

  // Simple similarity calculation based on common words
  const words1 = name1.split(/\s+/);
  const words2 = name2.split(/\s+/);

  const commonWords = words1.filter((word) => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

/**
 * Similar items helper class for managing item similarity operations
 */
export class SimilarItemsHelper {
  /**
   * Find similar items with similarity scoring
   */
  static async findSimilarItemsWithScore(
    categoryId: number,
    itemContext: { name: string; description?: string },
  ): Promise<Array<{ item: any; score: number }>> {
    const similarItems = await findSimilarItems(categoryId, itemContext);

    return similarItems
      .map((item) => ({
        item,
        score: calculateSimilarity(itemContext, item),
      }))
      .sort((a, b) => b.score - a.score);
  }
}
