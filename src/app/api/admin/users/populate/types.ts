export interface FieldSuggestion {
  fieldName: string;
  suggestedValue: string;
  confidence: number;
  source: "taxonomy" | "similar_items" | "defaults";
  reasoning: string;
}

export interface CategoryRequirements {
  requiredFields: string[];
  optionalFields: string[];
  fieldTypes: Record<string, string>;
  validationRules: Record<string, any>;
}

export interface AutoPopulateResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
