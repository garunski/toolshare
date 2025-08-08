// Removed direct operation import - now using direct mapping logic

export interface AttributeMapping {
  externalAttribute: string;
  internalField: string;
  mappingType: "direct" | "transform" | "composite";
  transformation?: (value: any) => any;
  validation?: (value: any) => boolean;
  isRequired: boolean;
  defaultValue?: any;
}

// Core mappings extracted to reduce file size
export const CORE_MAPPINGS: Record<string, AttributeMapping> = {
  id: {
    externalAttribute: "product_id",
    internalField: "external_id",
    mappingType: "direct",
    isRequired: true,
  },
  title: {
    externalAttribute: "product_name",
    internalField: "name",
    mappingType: "direct",
    isRequired: true,
  },
  description: {
    externalAttribute: "product_description",
    internalField: "description",
    mappingType: "transform",
    transformation: (value: string) => value?.substring(0, 500) || "",
    isRequired: false,
  },
  location: {
    externalAttribute: "location",
    internalField: "location",
    mappingType: "direct",
    isRequired: false,
    defaultValue: "Local pickup available",
  },
  images: {
    externalAttribute: "image_urls",
    internalField: "images",
    mappingType: "transform",
    transformation: (value: string | string[]) => {
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    },
    isRequired: false,
    defaultValue: [],
  },
  availability: {
    externalAttribute: "in_stock",
    internalField: "is_available",
    mappingType: "transform",
    transformation: (value: any) => Boolean(value),
    isRequired: false,
    defaultValue: true,
  },
  condition: {
    externalAttribute: "condition",
    internalField: "condition",
    mappingType: "transform",
    transformation: (value: string) => normalizeCondition(value),
    isRequired: false,
    defaultValue: "good",
  },
};

/**
 * Normalize condition values to standard format
 */
export function normalizeCondition(value: string): string {
  if (!value) return "good";

  const normalized = value.toLowerCase().trim();

  if (normalized.includes("new") || normalized.includes("mint")) {
    return "new";
  }
  if (normalized.includes("excellent") || normalized.includes("like new")) {
    return "excellent";
  }
  if (normalized.includes("good") || normalized.includes("fair")) {
    return "good";
  }
  if (normalized.includes("poor") || normalized.includes("damaged")) {
    return "poor";
  }

  return "good";
}
