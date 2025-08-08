interface SearchFacets {
  categories: { id: number; name: string; count: number }[];
  conditions: { value: string; count: number }[];
  locations: { value: string; count: number }[];
}

export async function getSearchFacets(supabase: any): Promise<SearchFacets> {
  // Get category facets
  const { data: categoryFacets } = await supabase
    .from("items")
    .select(
      `
      category_id,
      categories!inner(name)
    `,
    )
    .eq("is_public", true)
    .not("category_id", "is", null);

  // Get condition facets
  const { data: conditionFacets } = await supabase
    .from("items")
    .select("condition")
    .eq("is_public", true)
    .not("condition", "is", null);

  // Get location facets
  const { data: locationFacets } = await supabase
    .from("items")
    .select("location")
    .eq("is_public", true)
    .not("location", "is", null);

  // Process category facets
  const categoryCounts = new Map<number, { name: string; count: number }>();
  categoryFacets?.forEach((item: any) => {
    const id = item.category_id;
    const name = item.categories?.name || "Unknown";
    categoryCounts.set(id, {
      name,
      count: (categoryCounts.get(id)?.count || 0) + 1,
    });
  });

  // Process condition facets
  const conditionCounts = new Map<string, number>();
  conditionFacets?.forEach((item: any) => {
    const condition = item.condition;
    conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
  });

  // Process location facets
  const locationCounts = new Map<string, number>();
  locationFacets?.forEach((item: any) => {
    const location = item.location;
    locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  });

  return {
    categories: Array.from(categoryCounts.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
    })),
    conditions: Array.from(conditionCounts.entries()).map(([value, count]) => ({
      value,
      count,
    })),
    locations: Array.from(locationCounts.entries()).map(([value, count]) => ({
      value,
      count,
    })),
  };
}
