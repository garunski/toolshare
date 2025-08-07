interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "critical";
  message: string;
  timestamp: Date;
  metrics?: Record<string, any>;
}

export class HealthHelpers {
  /**
   * Determine overall status from health checks
   */
  static determineOverallStatus(
    checks: HealthCheck[],
  ): "healthy" | "warning" | "critical" {
    if (checks.some((check) => check.status === "critical")) {
      return "critical";
    }

    if (checks.some((check) => check.status === "warning")) {
      return "warning";
    }

    return "healthy";
  }
}
