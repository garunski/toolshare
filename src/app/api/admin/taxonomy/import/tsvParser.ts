interface TaxonomyRecord {
  external_id: number;
  category_path: string;
  parent_id: number | null;
  level: number;
}

/**
 * TSV parsing utilities for taxonomy import
 */
export class TSVParser {
  /**
   * Parse TSV content into records
   */
  static parseTSVContent(content: string): TaxonomyRecord[] {
    const lines = content.trim().split("\n");
    const records: TaxonomyRecord[] = [];

    // Skip header if present
    const dataLines = lines[0].includes("external_id") ? lines.slice(1) : lines;

    for (const line of dataLines) {
      const [external_id, category_path, parent_id, level] = line.split("\t");

      if (external_id && category_path) {
        records.push({
          external_id: parseInt(external_id),
          category_path: category_path.trim(),
          parent_id: parent_id ? parseInt(parent_id) : null,
          level: level ? parseInt(level) : 0,
        });
      }
    }

    return records;
  }

  /**
   * Validate TSV format
   */
  static validateTSVFormat(content: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const lines = content.trim().split("\n");

    if (lines.length === 0) {
      errors.push("Empty file");
      return { isValid: false, errors };
    }

    // Check header
    const header = lines[0];
    const expectedColumns = [
      "external_id",
      "category_path",
      "parent_id",
      "level",
    ];
    const hasHeader = expectedColumns.some((col) => header.includes(col));

    if (!hasHeader) {
      errors.push("Missing required header columns");
    }

    // Validate data lines
    const dataLines = hasHeader ? lines.slice(1) : lines;
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const columns = line.split("\t");

      if (columns.length < 2) {
        errors.push(`Line ${i + 1}: Insufficient columns`);
        continue;
      }

      const [external_id, category_path] = columns;

      if (!external_id || isNaN(parseInt(external_id))) {
        errors.push(`Line ${i + 1}: Invalid external_id`);
      }

      if (!category_path || category_path.trim() === "") {
        errors.push(`Line ${i + 1}: Missing category_path`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
