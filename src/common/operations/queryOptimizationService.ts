import { createClient } from "@/common/supabase/client";

import { OptimizationHelpers } from "../../app/api/admin/system/optimization/helpers/optimizationHelpers";

interface QueryCache {
  key: string;
  data: any;
  expiry: number;
}

export class QueryOptimizationService {
  private static cache: Map<string, QueryCache> = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async searchItems(filters: {
    search?: string;
    categoryId?: number;
    location?: string;
    condition?: string[];
    limit?: number;
    offset?: number;
  }) {
    const supabase = createClient();
    const cacheKey = `items:${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const query = OptimizationHelpers.buildItemSearchQuery(supabase, filters);
    const { data, error, count } = await query;

    if (error) throw error;

    const result = {
      data,
      count,
      hasMore: (count || 0) > (filters.offset || 0) + (filters.limit || 20),
    };
    this.setCache(cacheKey, result);

    return result;
  }

  static async loadCategoryHierarchy(maxDepth = 3) {
    const supabase = createClient();
    const cacheKey = `categories:hierarchy:${maxDepth}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("external_id, category_path, parent_id, level")
      .eq("is_active", true)
      .lte("level", maxDepth)
      .order("level")
      .order("category_path");

    if (error) throw error;

    const hierarchy = OptimizationHelpers.buildCategoryTree(data);
    this.setCache(cacheKey, hierarchy, 15 * 60 * 1000);

    return hierarchy;
  }

  static async batchLoadUserProfiles(userIds: string[]) {
    const supabase = createClient();
    const cacheKey = `profiles:batch:${userIds.sort().join(",")}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (error) throw error;

    const profileMap = new Map(data.map((profile) => [profile.id, profile]));
    this.setCache(cacheKey, profileMap);

    return profileMap;
  }

  static async getDashboardStats(userId?: string) {
    const supabase = createClient();
    const cacheKey = `dashboard:stats:${userId || "global"}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase.rpc("get_dashboard_stats", {
      user_id: userId,
    });

    if (error) throw error;

    this.setCache(cacheKey, data, 2 * 60 * 1000);
    return data;
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private static setCache(key: string, data: any, ttl = this.CACHE_TTL): void {
    this.cache.set(key, {
      key,
      data,
      expiry: Date.now() + ttl,
    });
  }

  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      key.includes(pattern),
    );

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}
