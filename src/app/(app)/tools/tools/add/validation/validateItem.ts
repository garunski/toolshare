import { z } from "zod";

import { createClient } from "@/common/supabase/client";

// Item creation schema
export const itemCreationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),

  description: z.string().max(1000, "Description too long").optional(),

  category_id: z.string().uuid("Invalid category ID"),

  condition: z.enum(["excellent", "good", "fair", "poor"]),

  attributes: z.record(z.string(), z.any()).optional(),

  images: z.array(z.string().url("Invalid image URL")).optional(),

  location: z.string().max(200, "Location too long").optional(),

  is_available: z.boolean().optional(),

  is_shareable: z.boolean().optional(),

  is_public: z.boolean().optional(),

  tags: z.array(z.string().max(50)).optional(),
});

// Item update schema
export const itemUpdateSchema = itemCreationSchema.partial().extend({
  id: z.string().uuid("Invalid item ID"),
});

// Item search filters schema
export const itemSearchFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  location: z.string().optional(),
  condition: z.array(z.enum(["excellent", "good", "fair", "poor"])).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Type inference from schemas
export type ItemCreationData = z.infer<typeof itemCreationSchema>;
export type ItemUpdateData = z.infer<typeof itemUpdateSchema>;
export type ItemSearchFiltersData = z.infer<typeof itemSearchFiltersSchema>;

// Validation helper functions
export function validateItemCreation(data: unknown): ItemCreationData {
  return itemCreationSchema.parse(data);
}

export function validateItemUpdate(data: unknown): ItemUpdateData {
  return itemUpdateSchema.parse(data);
}

export function validateSearchFilters(data: unknown): ItemSearchFiltersData {
  return itemSearchFiltersSchema.parse(data);
}

// Check if category exists and is active
export async function validateCategory(categoryId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

// Validate item condition
export function validateCondition(condition: string): boolean {
  return ["excellent", "good", "fair", "poor"].includes(condition);
}

// Validate image URLs
export function validateImageUrls(urls: string[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const url of urls) {
    try {
      new URL(url);
    } catch {
      errors.push(`Invalid image URL: ${url}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitize item data
export function sanitizeItemData(data: any) {
  return {
    ...data,
    name: data.name?.trim(),
    description: data.description?.trim(),
    location: data.location?.trim(),
    tags: data.tags
      ?.map((tag: string) => tag.trim().toLowerCase())
      .filter(Boolean),
  };
}
