import { createClient } from "@/common/supabase/client";
import type { ExternalTaxonomyNode } from "@/types/categories";

import { CategoryTreeOperations } from "./categoryTreeOperations";
import { ExternalTaxonomyOperations } from "./externalTaxonomyOperations";

interface GetCategoriesOptions {
  page?: number;
  limit?: number;
  level?: number;
  search?: string;
  parentId?: number;
}

interface GetCategoriesResult {
  categories: ExternalTaxonomyNode[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

export class PerformExternalTaxonomy {
  static async importExternalTaxonomy(
    options: GetCategoriesOptions = {},
  ): Promise<GetCategoriesResult> {
    const { page = 1, limit = 50, level, search, parentId } = options;

    const supabase = createClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from("external_product_taxonomy")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("level", { ascending: true })
      .order("category_path", { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (level !== undefined) {
      query = query.eq("level", level);
    }

    if (parentId !== undefined) {
      query = query.eq("parent_id", parentId);
    } else {
      // If no parent specified, get root categories (parent_id is null)
      query = query.is("parent_id", null);
    }

    if (search) {
      query = query.or(
        `category_path.ilike.%${search}%,external_id.eq.${parseInt(search) || 0}`,
      );
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch external categories: ${error.message}`);
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Transform to ExternalTaxonomyNode format
    const categories: ExternalTaxonomyNode[] = (data || []).map((item) => ({
      external_id: item.external_id,
      category_path: item.category_path,
      parent_id: item.parent_id,
      level: item.level,
      is_active: item.is_active,
      last_updated: item.last_updated,
      children: [], // Will be populated separately if needed
    }));

    return {
      categories,
      totalPages,
      totalCount,
      currentPage: page,
    };
  }

  static async getCategoryById(
    externalId: number,
  ): Promise<ExternalTaxonomyNode | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .eq("external_id", externalId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      external_id: data.external_id,
      category_path: data.category_path,
      parent_id: data.parent_id,
      level: data.level,
      is_active: data.is_active,
      last_updated: data.last_updated,
      children: [],
    };
  }

  static async getCategoryChildren(
    parentId: number,
  ): Promise<ExternalTaxonomyNode[]> {
    return CategoryTreeOperations.getCategoryChildren(parentId);
  }

  static async getCategoryTree(
    externalId: number,
    maxDepth: number = 3,
  ): Promise<ExternalTaxonomyNode | null> {
    return CategoryTreeOperations.getCategoryTree(externalId, maxDepth);
  }

  static async searchCategories(
    searchTerm: string,
    limit: number = 20,
  ): Promise<ExternalTaxonomyNode[]> {
    return ExternalTaxonomyOperations.searchCategories(searchTerm, limit);
  }

  static async getCategoryStats(): Promise<{
    totalCategories: number;
    levels: Record<number, number>;
    activeCategories: number;
  }> {
    return ExternalTaxonomyOperations.getCategoryStats();
  }
}
