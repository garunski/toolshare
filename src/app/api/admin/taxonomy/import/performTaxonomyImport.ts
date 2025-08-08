import { createClient } from "@/common/supabase/server";

import { TSVParser } from "./tsvParser";

interface TaxonomyRecord {
  external_id: number;
  category_path: string;
  parent_id: number | null;
  level: number;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  stats?: {
    totalCategories: number;
    lastImportDate: string | null;
    topLevelCategories: number;
  };
}

export class PerformTaxonomyImport {
  // Import taxonomy from TSV URL
  static async importFromTSV(sourceUrl: string): Promise<ImportResult> {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch taxonomy: ${response.statusText}`);
      }

      const tsvContent = await response.text();
      const records = TSVParser.parseTSVContent(tsvContent);

      return await this.storeTaxonomyRecords(records);
    } catch (error) {
      console.error("Taxonomy import failed:", error);
      return {
        success: false,
        imported: 0,
        errors: [(error as Error).message],
      };
    }
  }

  // Store taxonomy records in database
  private static async storeTaxonomyRecords(
    records: TaxonomyRecord[],
  ): Promise<ImportResult> {
    const supabase = await createClient();
    const errors: string[] = [];
    let imported = 0;

    // Clear existing taxonomy
    await supabase
      .from("external_product_taxonomy")
      .delete()
      .neq("external_id", 0);

    // Insert in batches to handle large datasets
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { error } = await supabase.from("external_product_taxonomy").insert(
        batch.map((record) => ({
          external_id: record.external_id,
          category_path: record.category_path,
          parent_id: record.parent_id,
          level: record.level,
          is_active: true,
          last_updated: new Date().toISOString(),
        })),
      );

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        imported += batch.length;
      }
    }

    return {
      success: errors.length === 0,
      imported,
      errors,
    };
  }

  static async getImportStats(): Promise<{
    totalCategories: number;
    lastImportDate: string | null;
    topLevelCategories: number;
  }> {
    const supabase = await createClient();

    const { data: categories } = await supabase
      .from("external_product_taxonomy")
      .select("level, last_updated")
      .eq("is_active", true);

    const totalCategories = categories?.length || 0;
    const topLevelCategories =
      categories?.filter((c) => c.level === 0).length || 0;
    const lastImportDate = categories?.length
      ? Math.max(...categories.map((c) => new Date(c.last_updated).getTime()))
      : null;

    return {
      totalCategories,
      lastImportDate: lastImportDate
        ? new Date(lastImportDate).toISOString()
        : null,
      topLevelCategories,
    };
  }

  static validateTSVFormat(content: string): {
    isValid: boolean;
    errors: string[];
  } {
    return TSVParser.validateTSVFormat(content);
  }
}
