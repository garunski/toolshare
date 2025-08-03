import { z } from "zod";

export const friendRequestValidator = z.object({
  receiver_id: z.string().uuid("Invalid user ID"),
  message: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
});

export const friendRequestResponseValidator = z.object({
  request_id: z.string().uuid("Invalid request ID"),
  action: z.enum(["accept", "reject"]),
});

export const loanRatingValidator = z.object({
  loan_id: z.string().uuid("Invalid loan ID"),
  rated_user_id: z.string().uuid("Invalid user ID"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .max(1000, "Comment must be less than 1000 characters")
    .optional(),
});

export const userProfileUpdateValidator = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .optional(),
  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const messageValidator = z.object({
  receiver_id: z.string().uuid("Invalid user ID"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(1000, "Message must be less than 1000 characters"),
  loan_id: z.string().uuid("Invalid loan ID").optional(),
});

export const conversationQueryValidator = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});
