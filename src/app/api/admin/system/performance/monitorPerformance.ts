import { PerformanceHelpers } from "./helpers/performanceHelpers";
import { PerformanceAnalyzer } from "./performanceAnalyzer";
import { PerformanceTracker } from "./performanceTracker";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  /**
   * Monitor performance metrics
   */
  static async monitorPerformance(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const performanceData = await PerformanceHelpers.getPerformanceData();
      return { success: true, data: performanceData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Track performance metrics
   */
  static async trackPerformanceMetrics(
    metric: Omit<PerformanceMetric, "timestamp">,
  ): Promise<{ success: boolean; error?: string }> {
    return PerformanceTracker.trackPerformanceMetrics(metric);
  }

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
    return PerformanceAnalyzer.analyzePerformance(timeRange);
  }

  /**
   * Get performance report
   */
  static async getPerformanceReport(): Promise<{
    success: boolean;
    report?: any;
    error?: string;
  }> {
    return PerformanceAnalyzer.getPerformanceReport();
  }
}
