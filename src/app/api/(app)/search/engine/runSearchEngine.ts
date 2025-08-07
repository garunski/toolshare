import {
  getSavedSearches,
  saveSearch,
  trackSearch,
} from "../../../admin/analytics/search/analyzeSearch";
import {
  buildSearchQuery,
  getSearchFacets,
} from "../core/performAdvancedSearch";
import {
  getSearchSuggestions,
  processCategoryFacets,
  processConditionFacets,
  processLocationFacets,
} from "../helpers/searchHelpers";

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

interface SearchResult {
  items: any[];
  totalCount: number;
  facets: {
    categories: { id: number; name: string; count: number }[];
    conditions: { value: string; count: number }[];
    locations: { value: string; count: number }[];
  };
  suggestions: string[];
  searchTime: number;
}

export class SearchEngine {
  /**
   * Perform advanced search with filters and facets
   */
  static async executeSearch(
    filters: SearchFilters,
    limit = 20,
    offset = 0,
  ): Promise<SearchResult> {
    const startTime = performance.now();

    // Build and execute search query
    const query = buildSearchQuery(filters, limit, offset);
    const { data: items, error, count } = await query;

    if (error) throw error;

    // Get facets for filtering UI
    const facets = await this.getFacets(filters);

    // Get search suggestions
    const suggestions = filters.query
      ? await getSearchSuggestions(filters.query)
      : [];

    const searchTime = performance.now() - startTime;

    return {
      items: items || [],
      totalCount: count || 0,
      facets,
      suggestions,
      searchTime,
    };
  }

  /**
   * Get facets for filter UI
   */
  private static async getFacets(filters: SearchFilters) {
    const { categoryFacets, conditionFacets, locationFacets } =
      await getSearchFacets();

    // Process facets
    const categories = processCategoryFacets(categoryFacets || []);
    const conditions = processConditionFacets(conditionFacets || []);
    const locations = processLocationFacets(locationFacets || []);

    return { categories, conditions, locations };
  }

  /**
   * Save search for user
   */
  static async saveUserSearch(
    userId: string,
    name: string,
    filters: SearchFilters,
  ): Promise<{ success: boolean; error?: string }> {
    return saveSearch(userId, name, filters);
  }

  /**
   * Get saved searches for user
   */
  static async getUserSavedSearches(userId: string) {
    return getSavedSearches(userId);
  }

  /**
   * Track search analytics
   */
  static async trackSearchAnalytics(
    query: string,
    filters: SearchFilters,
    resultsCount: number,
    userId?: string,
  ): Promise<void> {
    return trackSearch(query, filters, resultsCount, userId);
  }
}
