import { OptimizationHelpers } from "./helpers/optimizationHelpers";
import { QueryAnalyzer } from "./queryAnalyzer";

export class QueryOptimizer {
  /**
   * Suggest query optimizations
   */
  static async suggestQueryOptimizations(): Promise<{
    success: boolean;
    suggestions?: any[];
    error?: string;
  }> {
    try {
      const stats = await OptimizationHelpers.getQueryPerformanceStats();
      if (!stats.success) {
        return {
          success: false,
          error: "Failed to get query performance stats",
        };
      }

      const suggestions = this.generateOptimizationSuggestions(stats.analysis);
      return { success: true, suggestions };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get optimization report
   */
  static async getOptimizationReport(): Promise<{
    success: boolean;
    report?: any;
    error?: string;
  }> {
    try {
      const analysis = await QueryAnalyzer.analyzeQueryPerformance();
      if (!analysis.success) {
        return { success: false, error: analysis.error };
      }

      const report = {
        timestamp: new Date().toISOString(),
        slowQueries: analysis.analysis?.slowQueries || [],
        optimizationSuggestions:
          analysis.analysis?.optimizationSuggestions || [],
        priority: this.determineOptimizationPriority(analysis.analysis),
      };

      return { success: true, report };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate optimization suggestions
   */
  private static generateOptimizationSuggestions(analysis: any): string[] {
    const suggestions: string[] = [];
    if (analysis.averageExecutionTime > 500) {
      suggestions.push(
        "Consider adding database indexes for frequently queried columns",
      );
    }
    if (analysis.totalQueries > 1000) {
      suggestions.push(
        "Implement query result caching to reduce database load",
      );
    }
    return suggestions;
  }

  /**
   * Determine optimization priority
   */
  private static determineOptimizationPriority(
    analysis: any,
  ): "high" | "medium" | "low" {
    if (!analysis) return "low";
    const slowQueryCount = analysis.slowQueries?.length || 0;
    const suggestionCount = analysis.optimizationSuggestions?.length || 0;
    if (slowQueryCount > 5 || suggestionCount > 3) return "high";
    else if (slowQueryCount > 2 || suggestionCount > 1) return "medium";
    return "low";
  }
}
