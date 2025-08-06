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

export class CategoryScoringHelper {
  /**
   * Score categories based on relevance
   */
  static scoreCategories(
    candidates: any[],
    context: ProductContext,
  ): CategorySuggestion[] {
    return candidates.map((category) => {
      const suggestion: CategorySuggestion = {
        external_id: category.external_id,
        category_path: category.category_path,
        confidence: 0,
        reasons: [],
        level: category.level,
      };

      const pathLower = category.category_path.toLowerCase();
      const nameLower = context.name.toLowerCase();
      const descLower = context.description?.toLowerCase() || "";

      // Direct name matches
      if (pathLower.includes(nameLower)) {
        suggestion.confidence += 40;
        suggestion.reasons.push("Product name matches category path");
      }

      // Word overlap scoring
      const nameWords = nameLower.split(/\s+/);
      const pathWords = pathLower.split(/[>\s]+/);
      const commonWords = nameWords.filter((word) => pathWords.includes(word));

      if (commonWords.length > 0) {
        const overlap = (commonWords.length / nameWords.length) * 30;
        suggestion.confidence += overlap;
        suggestion.reasons.push(`${commonWords.length} matching keywords`);
      }

      // Description relevance
      if (descLower) {
        const descWords = descLower.split(/\s+/);
        const descMatches = descWords.filter((word) =>
          pathWords.includes(word),
        );
        if (descMatches.length > 0) {
          suggestion.confidence += (descMatches.length / descWords.length) * 20;
          suggestion.reasons.push("Description keywords match");
        }
      }

      // Category depth preference (more specific is better)
      suggestion.confidence += Math.min(category.level * 5, 15);

      // Existing category bonus
      if (context.existingCategory === category.external_id) {
        suggestion.confidence += 25;
        suggestion.reasons.push("Currently assigned category");
      }

      return suggestion;
    });
  }
}
