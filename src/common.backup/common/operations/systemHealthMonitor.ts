import { createClient } from "@/common/supabase/client";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "critical";
  message: string;
  timestamp: Date;
  metrics?: Record<string, any>;
}

export class SystemHealthMonitor {
  /**
   * Run comprehensive health check
   */
  static async runHealthCheck(): Promise<{
    overall: "healthy" | "warning" | "critical";
    checks: HealthCheck[];
    summary: {
      total: number;
      healthy: number;
      warnings: number;
      critical: number;
    };
  }> {
    const checks = await Promise.all([
      this.checkDatabaseConnection(),
      this.checkStorageUsage(),
    ]);

    const summary = {
      total: checks.length,
      healthy: checks.filter((c) => c.status === "healthy").length,
      warnings: checks.filter((c) => c.status === "warning").length,
      critical: checks.filter((c) => c.status === "critical").length,
    };

    let overall: "healthy" | "warning" | "critical" = "healthy";
    if (summary.critical > 0) overall = "critical";
    else if (summary.warnings > 0) overall = "warning";

    return { overall, checks, summary };
  }

  /**
   * Check database connection
   */
  private static async checkDatabaseConnection(): Promise<HealthCheck> {
    const startTime = Date.now();
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          name: "Database Connection",
          status: "critical",
          message: `Database connection failed: ${error.message}`,
          timestamp: new Date(),
        };
      }

      return {
        name: "Database Connection",
        status: responseTime > 1000 ? "warning" : "healthy",
        message: `Database connection successful (${responseTime}ms)`,
        timestamp: new Date(),
        metrics: { responseTime },
      };
    } catch (error) {
      return {
        name: "Database Connection",
        status: "critical",
        message: `Database connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check storage usage
   */
  private static async checkStorageUsage(): Promise<HealthCheck> {
    const supabase = createClient();

    try {
      const { data: storageData } = await supabase
        .from("storage_usage")
        .select("total_size")
        .single();

      const totalSize = storageData?.total_size || 0;
      const sizeInGB = totalSize / (1024 * 1024 * 1024);
      const usagePercentage = (sizeInGB / 10) * 100; // Assuming 10GB limit

      let status: "healthy" | "warning" | "critical" = "healthy";
      let message = `Storage usage: ${sizeInGB.toFixed(2)}GB`;

      if (usagePercentage > 90) {
        status = "critical";
        message += " - Critical: Storage nearly full";
      } else if (usagePercentage > 75) {
        status = "warning";
        message += " - Warning: High storage usage";
      }

      return {
        name: "Storage Usage",
        status,
        message,
        timestamp: new Date(),
        metrics: { sizeInGB, usagePercentage },
      };
    } catch (error) {
      return {
        name: "Storage Usage",
        status: "warning",
        message: "Unable to check storage usage",
        timestamp: new Date(),
      };
    }
  }
}
