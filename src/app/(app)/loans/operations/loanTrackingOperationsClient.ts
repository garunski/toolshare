import {
  type LoanReturnData,
  type LoanStatusUpdateData,
  validateLoanReturn,
  validateLoanStatusUpdate,
} from "@/app/tools/tools/[id]/validation";

import {
  getLoanWithDetails,
  getUserLoans,
  performStatusUpdate,
  updateToolAvailability,
} from "./loanStatusOperationsClient";

export type LoanStatus =
  | "pending"
  | "approved"
  | "denied"
  | "active"
  | "returned"
  | "overdue";

export interface LoanStatusChange {
  loan_id: string;
  status: LoanStatus;
  changed_at: Date;
  changed_by: string;
  message?: string;
}

export async function trackLoanStatus(
  data: LoanStatusUpdateData,
): Promise<void> {
  const validatedData = validateLoanStatusUpdate(data);

  // Get loan details
  const loan = await getLoanWithDetails(validatedData.loan_id);

  // Update loan status
  await performStatusUpdate(
    validatedData.loan_id,
    validatedData.status,
    validatedData.message,
  );

  // Update tool availability based on status
  if (validatedData.status === "approved") {
    await updateToolAvailability(loan.tools.id, false);
  } else if (validatedData.status === "returned") {
    await updateToolAvailability(loan.tools.id, true);
  }
}

export async function processLoanReturn(data: LoanReturnData): Promise<void> {
  const validatedData = validateLoanReturn(data);

  // Get loan details
  const loan = await getLoanWithDetails(validatedData.loan_id);

  // Update loan status to returned
  await performStatusUpdate(
    validatedData.loan_id,
    "returned",
    validatedData.condition_notes,
  );

  // Mark tool as available
  await updateToolAvailability(loan.tools.id, true);
}

export async function getLoanStatus(
  loanId: string,
): Promise<LoanStatus | null> {
  const { createClient } = await import("@/common/supabase/client");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("status")
    .eq("id", loanId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.status as LoanStatus;
}

export async function getActiveLoans(userId: string): Promise<any[]> {
  return await getUserLoans(userId);
}
