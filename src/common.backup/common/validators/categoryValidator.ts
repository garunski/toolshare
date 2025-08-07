import { z } from "zod";

export const categoryCreationSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-&()]+$/,
      "Category name contains invalid characters",
    ),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  parent_id: z.string().uuid("Invalid parent category ID").optional(),

  icon: z.string().max(50, "Icon identifier too long").optional(),

  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .optional(),

  sort_order: z
    .number()
    .min(0, "Sort order must be non-negative")
    .max(9999, "Sort order too large")
    .optional(),

  metadata: z.record(z.string(), z.any()).optional(),
});

export const categoryUpdateSchema = categoryCreationSchema.partial().extend({
  id: z.string().uuid("Invalid category ID"),
});

export const categorySlugSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
});

// Type inference from schemas
export type CategoryCreationInput = z.infer<typeof categoryCreationSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategorySlugInput = z.infer<typeof categorySlugSchema>;

// Validation helper functions
export class CategoryValidator {
  static validateCategoryCreation(data: unknown): CategoryCreationInput {
    return categoryCreationSchema.parse(data);
  }

  static validateCategoryUpdate(data: unknown): CategoryUpdateInput {
    return categoryUpdateSchema.parse(data);
  }

  static validateSlug(data: unknown): CategorySlugInput {
    return categorySlugSchema.parse(data);
  }

  /**
   * Check if slug is available
   */
  static async isSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const { createClient } = await import("@/common/supabase/client");
    const supabase = createClient();

    let query = supabase.from("categories").select("id").eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;
    return !data || data.length === 0;
  }

  /**
   * Generate unique slug from name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Validate category hierarchy (prevent circular references)
   */
  static async validateHierarchy(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    if (categoryId === parentId) {
      return false; // Self-reference
    }

    const { createClient } = await import("@/common/supabase/client");
    const supabase = createClient();

    // Check if proposed parent is actually a descendant
    const { data } = await supabase
      .from("categories")
      .select("id, parent_id")
      .eq("is_active", true);

    if (!data) return true;

    const buildAncestors = (
      id: string,
      visited = new Set<string>(),
    ): string[] => {
      if (visited.has(id)) return []; // Circular reference detected
      visited.add(id);

      const category = data.find((c: any) => c.id === id);
      if (!category || !category.parent_id) return [];

      return [
        category.parent_id,
        ...buildAncestors(category.parent_id, visited),
      ];
    };

    const ancestors = buildAncestors(parentId);
    return !ancestors.includes(categoryId);
  }
}
