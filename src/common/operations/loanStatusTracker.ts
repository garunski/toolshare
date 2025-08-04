import {
  LoanReturn,
  LoanStatusUpdate,
  validateLoanReturn,
  validateLoanStatusUpdate,
} from "@/common/validators/borrowingRequestValidator";

import {
  fetchLoanWithDetails,
  fetchUserLoans,
  updateLoanInDatabase,
  updateToolAvailability,
} from "./loanStatusOperations";

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

export async function updateLoanStatus(data: LoanStatusUpdate): Promise<void> {
  const validatedData = validateLoanStatusUpdate(data);

  // Get loan details
  const loan = await fetchLoanWithDetails(validatedData.loan_id);

  // Update loan status
  await updateLoanInDatabase(
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

export async function processLoanReturn(data: LoanReturn): Promise<void> {
  const validatedData = validateLoanReturn(data);

  // Get loan details
  const loan = await fetchLoanWithDetails(validatedData.loan_id);

  // Update loan status to returned
  await updateLoanInDatabase(
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
  return await fetchUserLoans(userId);
}
