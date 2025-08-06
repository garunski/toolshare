import { z } from "zod";

// Taxonomy record validation schema
export const taxonomyRecordValidator = z.object({
  external_id: z.number().int().positive(),
  category_path: z.string().min(1).max(500),
  parent_id: z.number().int().positive().optional(),
  level: z.number().int().min(1).max(10),
  is_active: z.boolean().default(true),
  last_updated: z.string().datetime().optional(),
});

// Taxonomy import request validation schema
export const taxonomyImportRequestValidator = z.object({
  sourceUrl: z.string().url(),
  replaceExisting: z.boolean().default(true),
  validateStructure: z.boolean().default(true),
});

// Taxonomy import result validation schema
export const taxonomyImportResultValidator = z.object({
  success: z.boolean(),
  imported: z.number().int().min(0),
  errors: z.array(z.string()),
  stats: z
    .object({
      totalCategories: z.number().int().min(0),
      lastImportDate: z.string().datetime().nullable(),
      topLevelCategories: z.number().int().min(0),
    })
    .optional(),
});

// Export types
export type TaxonomyRecord = z.infer<typeof taxonomyRecordValidator>;
export type TaxonomyImportRequest = z.infer<
  typeof taxonomyImportRequestValidator
>;
export type TaxonomyImportResult = z.infer<
  typeof taxonomyImportResultValidator
>;

// Taxonomy validation class
export class TaxonomyValidator {
  // Validate taxonomy record
  static validateRecord(record: unknown): TaxonomyRecord {
    return taxonomyRecordValidator.parse(record);
  }

  // Validate import request
  static validateImportRequest(request: unknown): TaxonomyImportRequest {
    return taxonomyImportRequestValidator.parse(request);
  }

  // Validate import result
  static validateImportResult(result: unknown): TaxonomyImportResult {
    return taxonomyImportResultValidator.parse(result);
  }

  // Validate hierarchy integrity
  static validateHierarchy(records: TaxonomyRecord[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const idMap = new Map(records.map((r) => [r.external_id, r]));

    for (const record of records) {
      if (record.parent_id && !idMap.has(record.parent_id)) {
        errors.push(
          `Category ${record.external_id} references missing parent ${record.parent_id}`,
        );
      }

      // Check level consistency
      const pathParts = record.category_path.split(" > ");
      if (pathParts.length !== record.level) {
        errors.push(
          `Category ${record.external_id} level mismatch: path has ${pathParts.length} parts but level is ${record.level}`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate category path format
  static validateCategoryPath(path: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!path || path.trim().length === 0) {
      return { isValid: false, error: "Category path cannot be empty" };
    }

    if (path.length > 500) {
      return {
        isValid: false,
        error: "Category path too long (max 500 characters)",
      };
    }

    const pathRegex = /^[^>]+( > [^>]+)*$/;
    if (!pathRegex.test(path)) {
      return { isValid: false, error: "Invalid category path format" };
    }

    return { isValid: true };
  }

  // Validate external ID
  static validateExternalId(id: number): { isValid: boolean; error?: string } {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        isValid: false,
        error: "External ID must be a positive integer",
      };
    }

    return { isValid: true };
  }

  // Validate level
  static validateLevel(level: number): { isValid: boolean; error?: string } {
    if (!Number.isInteger(level) || level < 1 || level > 10) {
      return { isValid: false, error: "Level must be between 1 and 10" };
    }

    return { isValid: true };
  }
}
