import { z } from "zod";

// Friend request validation schema
export const validateFriendRequestSchema = z.object({
  receiver_id: z.string().uuid("Invalid user ID"),
  message: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
});

// Friend request response validation schema
export const validateFriendRequestResponseSchema = z.object({
  request_id: z.string().uuid("Invalid request ID"),
  action: z.enum(["accept", "reject"]),
});

// Loan rating validation schema
export const validateLoanRatingSchema = z.object({
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

// User profile update validation schema
export const validateUserProfileUpdateSchema = z.object({
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

// Message validation schema
export const validateMessageSchema = z.object({
  receiver_id: z.string().uuid("Invalid user ID"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(1000, "Message must be less than 1000 characters"),
  loan_id: z.string().uuid("Invalid loan ID").optional(),
});

// Conversation query validation schema
export const validateConversationQuerySchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

// Validation functions
export function validateFriendRequest(data: unknown) {
  return validateFriendRequestSchema.parse(data);
}

export function validateFriendRequestResponse(data: unknown) {
  return validateFriendRequestResponseSchema.parse(data);
}

export function validateLoanRating(data: unknown) {
  return validateLoanRatingSchema.parse(data);
}

export function validateUserProfileUpdate(data: unknown) {
  return validateUserProfileUpdateSchema.parse(data);
}

export function validateMessage(data: unknown) {
  return validateMessageSchema.parse(data);
}

export function validateConversationQuery(data: unknown) {
  return validateConversationQuerySchema.parse(data);
}

// TypeScript types
export type FriendRequestData = z.infer<typeof validateFriendRequestSchema>;
export type FriendRequestResponseData = z.infer<
  typeof validateFriendRequestResponseSchema
>;
export type LoanRatingData = z.infer<typeof validateLoanRatingSchema>;
export type UserProfileUpdateData = z.infer<
  typeof validateUserProfileUpdateSchema
>;
export type MessageData = z.infer<typeof validateMessageSchema>;
export type ConversationQueryData = z.infer<
  typeof validateConversationQuerySchema
>;
