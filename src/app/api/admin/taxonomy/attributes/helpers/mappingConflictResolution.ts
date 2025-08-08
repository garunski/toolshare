import { AttributeMapping } from "./mappingTypes";

/**
 * Conflict resolution helpers for attribute mappings
 */
export class MappingConflictResolution {
  /**
   * Resolve attribute mapping conflicts
   */
  static resolveAttributeMappingConflicts(
    mappings1: Record<string, AttributeMapping>,
    mappings2: Record<string, AttributeMapping>,
  ): Record<string, AttributeMapping> {
    const resolved: Record<string, AttributeMapping> = { ...mappings1 };

    Object.entries(mappings2).forEach(([key, mapping]) => {
      if (resolved[key]) {
        // Conflict resolution: prefer the more specific mapping
        if (
          mapping.mappingType === "transform" &&
          resolved[key].mappingType === "direct"
        ) {
          resolved[key] = mapping;
        } else if (mapping.isRequired && !resolved[key].isRequired) {
          resolved[key] = mapping;
        }
      } else {
        resolved[key] = mapping;
      }
    });

    return resolved;
  }
}
