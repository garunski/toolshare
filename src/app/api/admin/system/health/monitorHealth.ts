import { DatabaseHealth } from "./databaseHealth";
import { HealthHelpers } from "./healthHelpers";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "critical";
  message: string;
  timestamp: Date;
  metrics?: Record<string, any>;
}

export class SystemHealthMonitor {
  /**
   * Get system health status
   */
  static async getSystemHealthStatus(): Promise<{
    success: boolean;
    data?: {
      overall: "healthy" | "warning" | "critical";
      checks: HealthCheck[];
      timestamp: Date;
    };
    error?: string;
  }> {
    try {
      const checks = await Promise.all([
        this.checkSystemHealth(),
        DatabaseHealth.checkDatabaseConnection(),
      ]);

      const overall = HealthHelpers.determineOverallStatus(checks);
      const timestamp = new Date();

      return {
        success: true,
        data: {
          overall,
          checks,
          timestamp,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check system health
   */
  static async checkSystemHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const memoryUsage = process.memoryUsage();
      const responseTime = Date.now() - startTime;
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;

      let status: "healthy" | "warning" | "critical" = "healthy";
      let message = `System healthy (${responseTime}ms)`;

      if (memoryUsageMB > 500) {
        status = "warning";
        message = `High memory usage: ${memoryUsageMB.toFixed(2)}MB`;
      }

      if (memoryUsageMB > 1000) {
        status = "critical";
        message = `Critical memory usage: ${memoryUsageMB.toFixed(2)}MB`;
      }

      return {
        name: "System Health",
        status,
        message,
        timestamp: new Date(),
        metrics: {
          memoryUsageMB,
          responseTime,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
        },
      };
    } catch (error) {
      return {
        name: "System Health",
        status: "critical",
        message: "Failed to check system health",
        timestamp: new Date(),
      };
    }
  }
}
