export class PerformanceMonitoringHelpers {
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

  static calculatePerformanceSummary(
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
}
