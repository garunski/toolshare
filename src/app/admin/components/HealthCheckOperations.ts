import { HealthCheckHelpers } from "./HealthCheckHelpers";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  timestamp: Date;
}

export class HealthCheckOperations {
  static async runAllHealthChecks(): Promise<HealthCheck[]> {
    const checks = await Promise.all([
      HealthCheckHelpers.runDatabaseCheck(),
      HealthCheckHelpers.runCategoriesCheck(),
      HealthCheckHelpers.runAttributesCheck(),
      HealthCheckHelpers.runItemsCheck(),
      HealthCheckHelpers.runStorageCheck(),
    ]);

    return checks;
  }
}
