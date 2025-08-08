import { createClient } from "@/common/supabase/server";

import { getSearchFacets } from "./helpers/searchFacets";

interface SearchParams {
  query?: string;
  category?: string;
  availability?: string;
  page?: number;
  // Advanced search parameters
  categories?: string;
  conditions?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  tags?: string;
}

export async function getSearchResults(searchParams: SearchParams) {
  const supabase = await createClient();

  let query = supabase.from("items").select(
    `
      *,
      categories(name, slug),
      profiles!items_owner_id_fkey(name, avatar_url)
    `,
    { count: "exact" },
  );

  // Apply basic filters
  if (searchParams.query) {
    query = query.ilike("name", `%${searchParams.query}%`);
  }

  if (searchParams.category) {
    query = query.eq("category_id", searchParams.category);
  }

  // Apply advanced filters
  if (searchParams.categories) {
    const categoryIds = searchParams.categories
      .split(",")
      .map(Number)
      .filter(Boolean);
    if (categoryIds.length > 0) {
      query = query.in("category_id", categoryIds);
    }
  }

  if (searchParams.conditions) {
    const conditions = searchParams.conditions.split(",").filter(Boolean);
    if (conditions.length > 0) {
      query = query.in("condition", conditions);
    }
  }

  if (searchParams.location) {
    query = query.ilike("location", `%${searchParams.location}%`);
  }

  if (searchParams.tags) {
    const tags = searchParams.tags.split(",").filter(Boolean);
    if (tags.length > 0) {
      query = query.overlaps("tags", tags);
    }
  }

  if (searchParams.availability) {
    if (searchParams.availability === "available") {
      query = query.eq("is_available", true);
    } else if (searchParams.availability === "unavailable") {
      query = query.eq("is_available", false);
    }
  }

  // Only show public and available items by default
  query = query.eq("is_public", true);

  // Apply sorting
  const sortBy = searchParams.sortBy || "created_at";
  const sortOrder = searchParams.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Pagination
  const page = searchParams.page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const {
    data: tools,
    error,
    count,
  } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  // Get search facets for advanced filtering
  const facets = await getSearchFacets(supabase);

  return {
    tools: tools || [],
    facets,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}
