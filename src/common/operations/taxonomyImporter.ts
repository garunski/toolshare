import { createClient } from "@/common/supabase/client";

import { TaxonomyParser, type TaxonomyRecord } from "./taxonomyParser";

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

export class TaxonomyImporter {
  // Import taxonomy from TSV URL
  static async importFromTSV(sourceUrl: string): Promise<ImportResult> {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch taxonomy: ${response.statusText}`);
      }

      const tsvContent = await response.text();
      const records = TaxonomyParser.parseTSVContent(tsvContent);

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
    const supabase = createClient();
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

    return { success: errors.length === 0, imported, errors };
  }

  // Get import statistics
  static async getImportStats(): Promise<{
    totalCategories: number;
    lastImportDate: string | null;
    topLevelCategories: number;
  }> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("external_id, level, last_updated")
      .eq("is_active", true);

    if (error || !data) {
      return {
        totalCategories: 0,
        lastImportDate: null,
        topLevelCategories: 0,
      };
    }

    const lastImportDate =
      data.length > 0
        ? data.reduce(
            (latest, record) =>
              new Date(record.last_updated) > new Date(latest)
                ? record.last_updated
                : latest,
            data[0].last_updated,
          )
        : null;

    return {
      totalCategories: data.length,
      lastImportDate,
      topLevelCategories: data.filter((record) => record.level === 1).length,
    };
  }

  // Validate TSV format
  static validateTSVFormat(content: string): {
    isValid: boolean;
    errors: string[];
  } {
    return TaxonomyParser.validateTSVFormat(content);
  }
}
