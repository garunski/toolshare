import { createClient } from "@/common/supabase/server";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "critical";
  message: string;
  timestamp: Date;
  metrics?: Record<string, any>;
}

export class DatabaseHealth {
  /**
   * Check database connection
   */
  static async checkDatabaseConnection(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          name: "Database Connection",
          status: "critical",
          message: `Database error: ${error.message}`,
          timestamp: new Date(),
        };
      }

      let status: "healthy" | "warning" | "critical" = "healthy";
      let message = `Database connected (${responseTime}ms)`;

      if (responseTime > 1000) {
        status = "warning";
        message = `Slow database response: ${responseTime}ms`;
      }

      if (responseTime > 5000) {
        status = "critical";
        message = `Critical database response time: ${responseTime}ms`;
      }

      return {
        name: "Database Connection",
        status,
        message,
        timestamp: new Date(),
        metrics: {
          responseTime,
          hasData: !!data,
        },
      };
    } catch (error) {
      return {
        name: "Database Connection",
        status: "critical",
        message: "Failed to connect to database",
        timestamp: new Date(),
      };
    }
  }
}
