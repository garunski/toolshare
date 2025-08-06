import { z } from "zod";

// Attribute creation schema
export const attributeCreationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .regex(
      /^[a-z_][a-z0-9_]*$/,
      "Name must be lowercase with underscores only",
    ),

  display_label: z
    .string()
    .min(1, "Display label is required")
    .max(100, "Display label too long"),

  description: z.string().max(500, "Description too long").optional(),

  data_type: z.enum([
    "text",
    "number",
    "boolean",
    "date",
    "select",
    "multi_select",
    "url",
    "email",
  ]),

  is_required: z.boolean().optional(),

  validation_rules: z.record(z.string(), z.any()).optional(),

  default_value: z.string().optional(),

  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .optional(),

  display_order: z
    .number()
    .min(0, "Display order must be non-negative")
    .max(9999, "Display order too large")
    .optional(),

  is_searchable: z.boolean().optional(),

  is_filterable: z.boolean().optional(),

  help_text: z.string().max(200, "Help text too long").optional(),
});

// Attribute update schema
export const attributeUpdateSchema = attributeCreationSchema.partial().extend({
  id: z.string().uuid("Invalid attribute ID"),
});
