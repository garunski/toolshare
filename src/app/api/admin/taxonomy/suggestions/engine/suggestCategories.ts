import { createClient } from "@/common/supabase/client";

import { ScoreCategories } from "../../scoring/scoreCategories";

interface CategorySuggestion {
  external_id: number;
  category_path: string;
  confidence: number;
  reasons: string[];
  level: number;
}

interface ProductContext {
  name: string;
  description?: string;
  attributes?: Record<string, any>;
  tags?: string[];
  existingCategory?: number;
}

export class SuggestCategories {
  /**
   * Get category suggestions for product
   */
  static async runSuggestionEngine(
    context: ProductContext,
  ): Promise<CategorySuggestion[]> {
    const searchTerms = this.extractSearchTerms(context);
    const candidates = await this.findCandidateCategories(searchTerms);
    const scored = ScoreCategories.calculateCategoryScore(candidates, context);

    return scored
      .filter((suggestion) => suggestion.confidence > 30)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Extract search terms from product context
   */
  private static extractSearchTerms(context: ProductContext): string[] {
    const terms: string[] = [];

    // Extract from name
    if (context.name) {
      terms.push(...context.name.toLowerCase().split(/\s+/));
    }

    // Extract from description
    if (context.description) {
      const descWords = context.description
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2);
      terms.push(...descWords);
    }

    // Extract from tags
    if (context.tags) {
      terms.push(...context.tags.map((tag) => tag.toLowerCase()));
    }

    // Extract from attributes
    if (context.attributes) {
      Object.values(context.attributes).forEach((value) => {
        if (typeof value === "string") {
          terms.push(...value.toLowerCase().split(/\s+/));
        }
      });
    }

    // Remove duplicates and common words
    const stopWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ]);
    return [...new Set(terms)].filter(
      (term) => term.length > 2 && !stopWords.has(term),
    );
  }

  /**
   * Find candidate categories using text search
   */
  private static async findCandidateCategories(
    searchTerms: string[],
  ): Promise<any[]> {
    if (searchTerms.length === 0) return [];

    const supabase = createClient();
    const searchQuery = searchTerms.join(" | ");

    const { data: categories } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .textSearch("category_path", searchQuery)
      .eq("is_active", true)
      .limit(20);

    return categories || [];
  }

  /**
   * Auto-categorize based on highest confidence
   */
  static async autoCategorize(context: ProductContext): Promise<{
    suggested: CategorySuggestion | null;
    requiresReview: boolean;
    alternatives: CategorySuggestion[];
  }> {
    const suggestions = await this.runSuggestionEngine(context);

    if (suggestions.length === 0) {
      return { suggested: null, requiresReview: true, alternatives: [] };
    }

    const best = suggestions[0];
    const requiresReview = best.confidence < 70;
    const alternatives = suggestions.slice(1);

    return { suggested: best, requiresReview, alternatives };
  }
}
