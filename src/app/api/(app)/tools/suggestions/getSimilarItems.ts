import { createClient } from "@/common/supabase/server";
import type { Item } from "@/types/categories";

export interface SimilarItemsResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FieldSuggestion {
  fieldName: string;
  suggestedValue: string;
  confidence: number;
  source: "taxonomy" | "similar_items" | "defaults";
  reasoning: string;
}

export async function getSimilarItems(
  itemName: string,
  limit = 5,
): Promise<SimilarItemsResult<Item[]>> {
  try {
    const supabase = await createClient();

    // Search for items with similar names
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .or(`name.ilike.%${itemName}%,description.ilike.%${itemName}%`)
      .eq("is_public", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: `Failed to fetch similar items: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get similar items error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export function generateSuggestions(
  similarItems: Item[],
  itemContext: { name: string },
): FieldSuggestion[] {
  const suggestions: FieldSuggestion[] = [];

  if (similarItems.length === 0) return suggestions;

  // Analyze common patterns in similar items
  const commonConditions = getCommonValues(similarItems, "condition");
  const commonLocations = getCommonValues(similarItems, "location");

  if (commonConditions.length > 0) {
    suggestions.push({
      fieldName: "condition",
      suggestedValue: commonConditions[0],
      confidence: 70,
      source: "similar_items",
      reasoning: `Common condition for similar items: ${commonConditions[0]}`,
    });
  }

  if (commonLocations.length > 0) {
    suggestions.push({
      fieldName: "location",
      suggestedValue: commonLocations[0],
      confidence: 65,
      source: "similar_items",
      reasoning: `Common location for similar items: ${commonLocations[0]}`,
    });
  }

  return suggestions;
}

function getCommonValues(items: Item[], field: string): string[] {
  const values = items
    .map((item) => (item as any)[field])
    .filter((value) => value && typeof value === "string");

  const valueCounts = values.reduce(
    (acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(valueCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([value]) => value);
}
