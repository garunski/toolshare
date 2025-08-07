export class QueryOptimizationHelpers {
  static buildItemSearchQuery(
    supabase: any,
    filters: {
      search?: string;
      categoryId?: number;
      location?: string;
      condition?: string[];
      limit?: number;
      offset?: number;
    },
  ) {
    let query = supabase
      .from("items")
      .select(
        `
        id,
        name,
        description,
        condition,
        images,
        location,
        is_available,
        created_at,
        external_category_id,
        external_product_taxonomy:external_category_id (
          category_path
        ),
        profiles:owner_id (
          full_name,
          avatar_url
        )
      `,
      )
      .eq("is_public", true)
      .eq("is_available", true);

    if (filters.search) {
      query = query.textSearch("search_vector", filters.search);
    }

    if (filters.categoryId) {
      query = query.eq("external_category_id", filters.categoryId);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.condition?.length) {
      query = query.in("condition", filters.condition);
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order("created_at", { ascending: false });

    return query;
  }

  static buildCategoryTree(flatData: any[]): any[] {
    const nodeMap = new Map();
    const roots: any[] = [];

    flatData.forEach((item) => {
      nodeMap.set(item.external_id, { ...item, children: [] });
    });

    flatData.forEach((item) => {
      const node = nodeMap.get(item.external_id);
      if (item.parent_id && nodeMap.has(item.parent_id)) {
        nodeMap.get(item.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
