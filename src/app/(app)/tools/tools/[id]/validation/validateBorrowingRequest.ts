import { z } from "zod";

export const borrowingRequestSchema = z.object({
  tool_id: z.string().uuid("Invalid tool ID"),
  start_date: z.date().min(new Date(), "Start date must be in the future"),
  end_date: z.date(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be less than 500 characters"),
});

export const loanStatusUpdateSchema = z.object({
  loan_id: z.string().uuid("Invalid loan ID"),
  status: z.enum(["approved", "denied", "returned"]),
  message: z.string().optional(),
});

export const loanReturnSchema = z.object({
  loan_id: z.string().uuid("Invalid loan ID"),
  condition_notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type BorrowingRequestData = z.infer<typeof borrowingRequestSchema>;
export type LoanStatusUpdateData = z.infer<typeof loanStatusUpdateSchema>;
export type LoanReturnData = z.infer<typeof loanReturnSchema>;

export function validateBorrowingRequest(data: unknown): BorrowingRequestData {
  return borrowingRequestSchema.parse(data);
}

export function validateLoanStatusUpdate(data: unknown): LoanStatusUpdateData {
  return loanStatusUpdateSchema.parse(data);
}

export function validateLoanReturn(data: unknown): LoanReturnData {
  return loanReturnSchema.parse(data);
}
