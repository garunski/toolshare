import { z } from "zod";

export const toolCreationSchema = z.object({
  name: z
    .string()
    .min(2, "Tool name must be at least 2 characters")
    .max(100, "Tool name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.enum([
    "Power Tools",
    "Hand Tools",
    "Garden Tools",
    "Automotive",
    "Cleaning",
    "Ladders & Scaffolding",
    "Safety Equipment",
    "Other",
  ]),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  is_available: z.boolean().default(true),
  images: z.array(z.string()).optional(),
});

export const toolUpdateSchema = toolCreationSchema.partial().extend({
  id: z.string().uuid("Invalid tool ID"),
});

export const toolSearchSchema = z.object({
  query: z.string().optional(),
  category: z
    .enum([
      "Power Tools",
      "Hand Tools",
      "Garden Tools",
      "Automotive",
      "Cleaning",
      "Ladders & Scaffolding",
      "Safety Equipment",
      "Other",
    ])
    .optional(),
  condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),
  is_available: z.boolean().optional(),
  owner_id: z.string().uuid().optional(),
});

export const toolFilterSchema = z.object({
  categories: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  availability: z.boolean().optional(),
});

export type ToolCreationData = z.infer<typeof toolCreationSchema>;
export type ToolUpdateData = z.infer<typeof toolUpdateSchema>;
export type ToolSearchData = z.infer<typeof toolSearchSchema>;
export type ToolFilterData = z.infer<typeof toolFilterSchema>;

// Validation helper functions
export function validateToolCreation(data: unknown): ToolCreationData {
  return toolCreationSchema.parse(data);
}

export function validateToolUpdate(data: unknown): ToolUpdateData {
  return toolUpdateSchema.parse(data);
}

export function validateToolSearch(data: unknown): ToolSearchData {
  return toolSearchSchema.parse(data);
}

export function validateToolFilter(data: unknown): ToolFilterData {
  return toolFilterSchema.parse(data);
}

