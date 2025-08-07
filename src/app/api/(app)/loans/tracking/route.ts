import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  getActiveLoans,
  getLoanStatus,
  processLoanReturn,
  trackLoanStatus,
  type LoanReturn,
  type LoanStatusUpdate,
} from "../../../../(app)/loans/operations/loanTrackingOperations";

const loanStatusUpdateSchema = z.object({
  loan_id: z.string().uuid(),
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

const loanReturnSchema = z.object({
  loan_id: z.string().uuid(),
  condition_notes: z.string(),
});

const loanStatusQuerySchema = z.object({
  loanId: z.string().uuid(),
});

const activeLoansQuerySchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine if this is a status update or loan return
    if (body.loan_id && body.status) {
      const validatedData = loanStatusUpdateSchema.parse(body);
      await trackLoanStatus(validatedData as LoanStatusUpdate);
    } else if (body.loan_id && body.condition_notes) {
      const validatedData = loanReturnSchema.parse(body);
      await processLoanReturn(validatedData as LoanReturn);
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing loan tracking:", error);
    return NextResponse.json(
      { error: "Failed to process loan tracking" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");
    const userId = searchParams.get("userId");

    if (loanId) {
      const validatedData = loanStatusQuerySchema.parse({ loanId });
      const status = await getLoanStatus(validatedData.loanId);
      return NextResponse.json({ status });
    }

    if (userId) {
      const validatedData = activeLoansQuerySchema.parse({ userId });
      const loans = await getActiveLoans(validatedData.userId);
      return NextResponse.json(loans);
    }

    return NextResponse.json(
      { error: "Either loanId or userId parameter is required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error fetching loan tracking data:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan tracking data" },
      { status: 500 },
    );
  }
}
