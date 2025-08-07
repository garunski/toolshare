import { createClient } from "@/common/supabase/server";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceTracker {
  /**
   * Track performance metrics
   */
  static async trackPerformanceMetrics(
    metric: Omit<PerformanceMetric, "timestamp">,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase.from("performance_metrics").insert({
        name: metric.name,
        value: metric.value,
        metadata: metric.metadata,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to track performance metric:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
