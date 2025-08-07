import { OptimizationHelpers } from "./helpers/optimizationHelpers";

export class QueryAnalyzer {
  /**
   * Analyze query performance
   */
  static async analyzeQueryPerformance(): Promise<{
    success: boolean;
    analysis?: any;
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

      const analysis = {
        slowQueries: this.identifySlowQueries(stats.stats),
        optimizationSuggestions: this.generateOptimizationSuggestions(
          stats.analysis,
        ),
      };

      return { success: true, analysis };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Identify slow queries
   */
  private static identifySlowQueries(stats: any[]): any[] {
    return stats
      .filter((stat) => stat.execution_time > 1000)
      .sort((a, b) => b.execution_time - a.execution_time)
      .slice(0, 10)
      .map((stat) => ({
        query: stat.query,
        executionTime: stat.execution_time,
        timestamp: stat.timestamp,
        recommendation: this.getQueryRecommendation(stat),
      }));
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
   * Get query recommendation based on performance
   */
  private static getQueryRecommendation(stat: any): string {
    if (stat.execution_time > 5000) {
      return "Critical: Query is extremely slow, consider rewriting or adding indexes";
    } else if (stat.execution_time > 1000) {
      return "Warning: Query is slow, consider optimization";
    }
    return "Query performance is acceptable";
  }
}
