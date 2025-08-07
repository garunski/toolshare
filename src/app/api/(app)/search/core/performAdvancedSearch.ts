import { createClient } from "@/common/supabase/client";

import { getSortColumn } from "../helpers/searchHelpers";

interface SearchFilters {
  query?: string;
  categories?: number[];
  location?: string;
  condition?: string[];
  priceRange?: { min?: number; max?: number };
  availability?: boolean;
  owner?: string;
  tags?: string[];
  dateRange?: { start?: string; end?: string };
  sortBy?: "relevance" | "date" | "name" | "condition" | "location";
  sortOrder?: "asc" | "desc";
}

/**
 * Build search query with filters
 */
export function buildSearchQuery(
  filters: SearchFilters,
  limit = 20,
  offset = 0,
) {
  const supabase = createClient();

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
      tags,
      attributes,
      external_product_taxonomy:external_category_id (
        category_path
      ),
      profiles:owner_id (
        id,
        full_name,
        avatar_url
      )
    `,
      { count: "exact" },
    )
    .eq("is_public", true);

  // Apply text search with ranking
  if (filters.query) {
    query = query.textSearch("search_vector", filters.query, {
      type: "websearch",
      config: "english",
    });
  }

  // Apply filters
  if (filters.categories?.length) {
    query = query.in("external_category_id", filters.categories);
  }

  if (filters.condition?.length) {
    query = query.in("condition", filters.condition);
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters.availability !== undefined) {
    query = query.eq("is_available", filters.availability);
  }

  if (filters.owner) {
    query = query.eq("owner_id", filters.owner);
  }

  if (filters.tags?.length) {
    query = query.overlaps("tags", filters.tags);
  }

  if (filters.dateRange?.start) {
    query = query.gte("created_at", filters.dateRange.start);
  }

  if (filters.dateRange?.end) {
    query = query.lte("created_at", filters.dateRange.end);
  }

  // Apply sorting
  const sortBy = filters.sortBy || "relevance";
  const sortOrder = filters.sortOrder || "desc";

  if (sortBy === "relevance" && filters.query) {
    // Use built-in text search ranking
    query = query.order("created_at", { ascending: sortOrder === "asc" });
  } else {
    const orderColumn = getSortColumn(sortBy);
    query = query.order(orderColumn, { ascending: sortOrder === "asc" });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  return query;
}

/**
 * Get facets for filter UI
 */
export async function getSearchFacets() {
  const supabase = createClient();

  // Get category facets
  const { data: categoryFacets } = await supabase
    .from("items")
    .select(
      `
      external_category_id,
      external_product_taxonomy:external_category_id (category_path)
    `,
    )
    .eq("is_public", true);

  // Get condition facets
  const { data: conditionFacets } = await supabase
    .from("items")
    .select("condition")
    .eq("is_public", true);

  // Get location facets
  const { data: locationFacets } = await supabase
    .from("items")
    .select("location")
    .eq("is_public", true)
    .not("location", "is", null);

  return { categoryFacets, conditionFacets, locationFacets };
}
