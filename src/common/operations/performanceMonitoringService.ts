import { PerformanceHelpers } from "../../app/api/admin/system/performance/helpers/performanceHelpers";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitoringService {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;

  static recordPageLoad(pageName: string): void {
    if (typeof window === "undefined") return;

    PerformanceHelpers.recordCoreWebVitals(pageName, (name, value) => {
      this.addMetric(name, value);
    });

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.addMetric(
        `${pageName}.loadTime`,
        navigation.loadEventEnd - navigation.loadEventStart,
      );
      this.addMetric(
        `${pageName}.domContentLoaded`,
        navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
      );
      this.addMetric(
        `${pageName}.firstByte`,
        navigation.responseStart - navigation.requestStart,
      );
    }
  }

  static recordQuery(
    queryName: string,
    startTime: number,
    metadata?: Record<string, any>,
  ): void {
    const duration = performance.now() - startTime;
    this.addMetric(`query.${queryName}`, duration, metadata);

    if (duration > 1000) {
      console.warn(
        `Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`,
        metadata,
      );
    }
  }

  static recordRender(componentName: string, renderTime: number): void {
    this.addMetric(`render.${componentName}`, renderTime);

    if (renderTime > 16) {
      console.warn(
        `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`,
      );
    }
  }

  static recordInteraction(action: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.addMetric(`interaction.${action}`, duration);
  }

  static recordMemoryUsage(): void {
    if (typeof window === "undefined" || !("memory" in performance)) return;

    const memory = (performance as any).memory;
    this.addMetric("memory.used", memory.usedJSHeapSize);
    this.addMetric("memory.total", memory.totalJSHeapSize);
    this.addMetric("memory.limit", memory.jsHeapSizeLimit);
  }

  static getPerformanceSummary(timeRange = 300000) {
    return PerformanceHelpers.calculatePerformanceMetrics(
      this.metrics,
      timeRange,
    );
  }

  private static addMetric(
    name: string,
    value: number,
    metadata?: Record<string, any>,
  ): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  static async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const summary = this.getPerformanceSummary();

    try {
      await fetch("/api/analytics/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summary),
      });
    } catch (error) {
      console.error("Failed to send performance metrics:", error);
    }
  }
}
