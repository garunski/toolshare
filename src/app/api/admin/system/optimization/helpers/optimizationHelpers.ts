import { createClient } from "@/common/supabase/server";

export class OptimizationHelpers {
  /**
   * Format query plan for analysis
   */
  static formatQueryPlan(queryPlan: any) {
    return {
      executionTime: queryPlan.execution_time,
      planningTime: queryPlan.planning_time,
      totalTime: queryPlan.total_time,
      rows: queryPlan.rows,
      cost: queryPlan.cost,
      plan: queryPlan.plan,
    };
  }

  /**
   * Analyze query metrics for optimization
   */
  static analyzeQueryMetrics(metrics: any[]) {
    return {
      averageExecutionTime:
        metrics.reduce((sum, m) => sum + m.execution_time, 0) / metrics.length,
      slowestQuery: metrics.reduce((max, m) =>
        m.execution_time > max.execution_time ? m : max,
      ),
      fastestQuery: metrics.reduce((min, m) =>
        m.execution_time < min.execution_time ? m : min,
      ),
      totalQueries: metrics.length,
    };
  }

  /**
   * Build optimized item search query
   */
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

  /**
   * Build optimized category tree
   */
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

  /**
   * Get query performance statistics
   */
  static async getQueryPerformanceStats() {
    const supabase = await createClient();

    try {
      const { data: stats, error } = await supabase
        .from("query_performance_logs")
        .select("*")
        .order("execution_time", { ascending: false })
        .limit(100);

      if (error) throw error;

      return {
        success: true,
        stats: stats || [],
        analysis: this.analyzeQueryMetrics(stats || []),
      };
    } catch (error) {
      console.error("Failed to get query performance stats:", error);
      return { success: false, stats: [], analysis: null };
    }
  }
}
