import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

const userLoansSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);

    await performStatusUpdate(
      validatedData.loanId,
      validatedData.status,
      validatedData.message,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating loan status:", error);
    return NextResponse.json(
      { error: "Failed to update loan status" },
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
      const validatedData = loanDetailsSchema.parse({ loanId });
      const loan = await getLoanWithDetails(validatedData.loanId);
      return NextResponse.json(loan);
    }

    if (userId) {
      const validatedData = userLoansSchema.parse({ userId });
      const loans = await getUserLoans(validatedData.userId);
      return NextResponse.json(loans);
    }

    return NextResponse.json(
      { error: "Either loanId or userId parameter is required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error fetching loan data:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan data" },
      { status: 500 },
    );
  }
}
