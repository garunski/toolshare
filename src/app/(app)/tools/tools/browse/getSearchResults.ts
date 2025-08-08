import { createClient } from "@/common/supabase/server";

interface SearchParams {
  query?: string;
  category?: string;
  availability?: string;
  page?: number;
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

  // Apply filters
  if (searchParams.query) {
    query = query.ilike("name", `%${searchParams.query}%`);
  }

  if (searchParams.category) {
    query = query.eq("category_id", searchParams.category);
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

  // Pagination
  const page = searchParams.page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const {
    data: tools,
    error,
    count,
  } = await query
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    tools: tools || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}
