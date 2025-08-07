import { PerformanceHelpers } from "./helpers/performanceHelpers";

export class PerformanceAnalyzer {
  /**
   * Analyze performance data
   */
  static async analyzePerformance(
    timeRange: number = 24 * 60 * 60 * 1000,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const performanceData =
        await PerformanceHelpers.getPerformanceData(timeRange);
      if (!performanceData.success) {
        return { success: false, error: "Failed to get performance data" };
      }

      const analysis = {
        summary: performanceData.summary,
        slowestQueries: this.identifySlowQueries(performanceData.metrics),
        recommendations: this.generateRecommendations(performanceData.summary),
      };

      return { success: true, data: analysis };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get performance report
   */
  static async getPerformanceReport(): Promise<{
    success: boolean;
    report?: any;
    error?: string;
  }> {
    try {
      const analysis = await this.analyzePerformance();
      if (!analysis.success) {
        return { success: false, error: analysis.error };
      }

      const report = {
        timestamp: new Date().toISOString(),
        summary: analysis.data?.summary,
        slowQueries: analysis.data?.slowestQueries,
        recommendations: analysis.data?.recommendations,
        status: this.determinePerformanceStatus(analysis.data?.summary),
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
   * Identify slow queries from metrics
   */
  private static identifySlowQueries(metrics: any[]): any[] {
    const queryMetrics = metrics.filter((m) => m.name.startsWith("query."));
    return queryMetrics
      .filter((m) => m.value > 1000)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((m) => ({
        name: m.name.replace("query.", ""),
        duration: m.value,
        timestamp: m.timestamp,
      }));
  }

  /**
   * Generate performance recommendations
   */
  private static generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];
    if (summary.avg && summary.avg["query.database"] > 500) {
      recommendations.push(
        "Consider optimizing database queries - average query time is high",
      );
    }
    if (summary.avg && summary.avg["render.component"] > 16) {
      recommendations.push(
        "Component rendering is slow - consider code splitting or optimization",
      );
    }
    if (summary.avg && summary.avg["memory.used"] > 100 * 1024 * 1024) {
      recommendations.push(
        "High memory usage detected - consider memory optimization",
      );
    }
    return recommendations;
  }

  /**
   * Determine overall performance status
   */
  private static determinePerformanceStatus(
    summary: any,
  ): "good" | "warning" | "critical" {
    if (!summary?.avg) return "good";
    const avgQueryTime = summary.avg["query.database"] || 0;
    const avgRenderTime = summary.avg["render.component"] || 0;
    if (avgQueryTime > 1000 || avgRenderTime > 50) return "critical";
    else if (avgQueryTime > 500 || avgRenderTime > 16) return "warning";
    return "good";
  }
}
