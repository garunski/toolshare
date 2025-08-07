import { createClient } from "@/common/supabase/server";

export async function findSimilarItems(
  categoryId: number,
  itemContext: { name: string; description?: string },
): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("category_id", categoryId)
      .or(
        `name.ilike.%${itemContext.name}%,description.ilike.%${itemContext.name}%`,
      )
      .limit(5);

    return data || [];
  } catch (error) {
    console.error("Find similar items error:", error);
    return [];
  }
}
