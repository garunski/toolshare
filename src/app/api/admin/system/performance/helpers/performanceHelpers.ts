import { createClient } from "@/common/supabase/server";

export class PerformanceHelpers {
  /**
   * Format performance data for analysis
   */
  static formatPerformanceData(metrics: any[]) {
    return metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      timestamp: metric.timestamp,
      page: metric.page,
      userId: metric.user_id,
      sessionId: metric.session_id,
    }));
  }

  /**
   * Calculate performance metrics from raw data
   */
  static calculatePerformanceMetrics(
    metrics: any[],
    timeRange: number,
  ): {
    avg: Record<string, number>;
    p95: Record<string, number>;
    count: Record<string, number>;
  } {
    const cutoff = Date.now() - timeRange;
    const recentMetrics = metrics.filter((m) => m.timestamp > cutoff);

    const grouped = new Map<string, number[]>();

    recentMetrics.forEach((metric) => {
      if (!grouped.has(metric.name)) {
        grouped.set(metric.name, []);
      }
      grouped.get(metric.name)!.push(metric.value);
    });

    const avg: Record<string, number> = {};
    const p95: Record<string, number> = {};
    const count: Record<string, number> = {};

    grouped.forEach((values, name) => {
      values.sort((a, b) => a - b);
      avg[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      p95[name] = values[Math.floor(values.length * 0.95)] || 0;
      count[name] = values.length;
    });

    return { avg, p95, count };
  }

  /**
   * Record Core Web Vitals for performance monitoring
   */
  static recordCoreWebVitals(
    pageName: string,
    addMetric: (name: string, value: number) => void,
  ): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          addMetric(`${pageName}.fcp`, entry.startTime);
        }
      });
    }).observe({ entryTypes: ["paint"] });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      addMetric(`${pageName}.lcp`, lastEntry.startTime);
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      addMetric(`${pageName}.cls`, clsValue);
    }).observe({ entryTypes: ["layout-shift"] });
  }

  /**
   * Get performance data from database
   */
  static async getPerformanceData(timeRange: number = 24 * 60 * 60 * 1000) {
    const supabase = await createClient();
    const cutoff = new Date(Date.now() - timeRange);

    try {
      const { data: metrics, error } = await supabase
        .from("performance_metrics")
        .select("*")
        .gte("timestamp", cutoff.toISOString())
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return {
        success: true,
        metrics: metrics || [],
        formatted: this.formatPerformanceData(metrics || []),
        summary: this.calculatePerformanceMetrics(metrics || [], timeRange),
      };
    } catch (error) {
      console.error("Failed to get performance data:", error);
      return {
        success: false,
        metrics: [],
        formatted: [],
        summary: { avg: {}, p95: {}, count: {} },
      };
    }
  }
}
