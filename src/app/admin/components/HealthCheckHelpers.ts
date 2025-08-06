import { createClient } from "@/common/supabase/client";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  timestamp: Date;
}

export class HealthCheckHelpers {
  static async runDatabaseCheck(): Promise<HealthCheck> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      return {
        name: "Database Connection",
        status: error ? "error" : "healthy",
        message: error
          ? `Connection failed: ${error.message}`
          : "Connected successfully",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Database Connection",
        status: "error",
        message: "Connection failed",
        timestamp: new Date(),
      };
    }
  }

  static async runCategoriesCheck(): Promise<HealthCheck> {
    try {
      const supabase = createClient();
      const { data: categories, error } = await supabase
        .from("categories")
        .select("id")
        .limit(1);

      return {
        name: "Categories System",
        status: error
          ? "error"
          : categories?.length === 0
            ? "warning"
            : "healthy",
        message: error
          ? `Error: ${error.message}`
          : categories?.length === 0
            ? "No categories configured"
            : "Categories available",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Categories System",
        status: "error",
        message: "Categories check failed",
        timestamp: new Date(),
      };
    }
  }

  static async runAttributesCheck(): Promise<HealthCheck> {
    try {
      const supabase = createClient();
      const { data: attributes, error } = await supabase
        .from("attribute_definitions")
        .select("id")
        .limit(1);

      return {
        name: "Attributes System",
        status: error
          ? "error"
          : attributes?.length === 0
            ? "warning"
            : "healthy",
        message: error
          ? `Error: ${error.message}`
          : attributes?.length === 0
            ? "No attributes defined"
            : "Attributes available",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Attributes System",
        status: "error",
        message: "Attributes check failed",
        timestamp: new Date(),
      };
    }
  }

  static async runItemsCheck(): Promise<HealthCheck> {
    try {
      const supabase = createClient();
      const { data: items, error } = await supabase
        .from("items")
        .select("id")
        .limit(1);

      return {
        name: "Items System",
        status: error ? "error" : "healthy",
        message: error ? `Error: ${error.message}` : "Items system operational",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Items System",
        status: "error",
        message: "Items check failed",
        timestamp: new Date(),
      };
    }
  }

  static async runStorageCheck(): Promise<HealthCheck> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.listBuckets();
      return {
        name: "Storage System",
        status: error ? "error" : "healthy",
        message: error
          ? `Storage error: ${error.message}`
          : `Storage operational (${data?.length || 0} buckets)`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Storage System",
        status: "error",
        message: "Storage check failed",
        timestamp: new Date(),
      };
    }
  }
}
