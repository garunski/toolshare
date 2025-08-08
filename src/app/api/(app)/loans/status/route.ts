import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import {
  getLoanWithDetails,
  getUserLoans,
  performStatusUpdate,
} from "../../../../(app)/loans/operations/loanStatusOperations";

const statusUpdateSchema = z.object({
  loanId: z.string().uuid(),
  status: z.enum([
    "pending",
    "approved",
    "denied",
    "active",
    "returned",
    "overdue",
  ]),
  message: z.string().optional(),
});

const loanDetailsSchema = z.object({
  loanId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);

    await performStatusUpdate(
      validatedData.loanId,
      validatedData.status,
      validatedData.message,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid request data", "VALIDATION_ERROR");
    }
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");

    if (loanId) {
      const validatedData = loanDetailsSchema.parse({ loanId });
      const result = await getLoanWithDetails(validatedData.loanId);
      return NextResponse.json(result);
    }

    // Get user's loans
    const result = await getUserLoans(userId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid request data", "VALIDATION_ERROR");
    }
    return handleApiError(error);
  }
}
