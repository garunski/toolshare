import { OptimizationHelpers } from "./helpers/optimizationHelpers";
import { QueryAnalyzer } from "./queryAnalyzer";
import { QueryOptimizer } from "./queryOptimizer";

export class QueryOptimizationService {
  /**
   * Optimize queries for better performance
   */
  static async optimizeQueries(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const stats = await OptimizationHelpers.getQueryPerformanceStats();
      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Analyze query performance
   */
  static async analyzeQueryPerformance(): Promise<{
    success: boolean;
    analysis?: any;
    error?: string;
  }> {
    return QueryAnalyzer.analyzeQueryPerformance();
  }

  /**
   * Suggest query optimizations
   */
  static async suggestQueryOptimizations(): Promise<{
    success: boolean;
    suggestions?: any[];
    error?: string;
  }> {
    return QueryOptimizer.suggestQueryOptimizations();
  }

  /**
   * Get optimization report
   */
  static async getOptimizationReport(): Promise<{
    success: boolean;
    report?: any;
    error?: string;
  }> {
    return QueryOptimizer.getOptimizationReport();
  }
}
