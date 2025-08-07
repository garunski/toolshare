interface TaxonomyRecord {
  external_id: number;
  category_path: string;
  parent_id?: number;
  level: number;
}

export class TaxonomyParser {
  // Parse TSV content into taxonomy records
  static parseTSVContent(tsvContent: string): TaxonomyRecord[] {
    const lines = tsvContent.trim().split("\n");
    const records: TaxonomyRecord[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const [idStr, categoryPath] = line.split("\t");
      const external_id = parseInt(idStr.trim());

      if (isNaN(external_id) || !categoryPath) continue;

      const pathParts = categoryPath.trim().split(" > ");
      const level = pathParts.length;

      // Find parent by reconstructing parent path
      let parent_id: number | undefined;
      if (level > 1) {
        const parentPath = pathParts.slice(0, -1).join(" > ");
        const parentRecord = records.find(
          (r) => r.category_path === parentPath,
        );
        parent_id = parentRecord?.external_id;
      }

      records.push({
        external_id,
        category_path: categoryPath.trim(),
        parent_id,
        level,
      });
    }

    return records;
  }

  // Validate TSV format
  static validateTSVFormat(content: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const lines = content.trim().split("\n");

    if (lines.length === 0) {
      errors.push("TSV file is empty");
      return { isValid: false, errors };
    }

    for (let i = 0; i < Math.min(lines.length, 100); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split("\t");
      if (parts.length !== 2) {
        errors.push(
          `Line ${i + 1}: Expected 2 tab-separated columns, got ${parts.length}`,
        );
        continue;
      }

      const [idStr, categoryPath] = parts;
      if (isNaN(parseInt(idStr))) {
        errors.push(`Line ${i + 1}: Invalid ID "${idStr}"`);
      }

      if (!categoryPath || categoryPath.length === 0) {
        errors.push(`Line ${i + 1}: Empty category path`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

export type { TaxonomyRecord };
