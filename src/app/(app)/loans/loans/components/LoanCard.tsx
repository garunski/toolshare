"use client";

import { LoanCardContent } from "./shared/LoanCardContent";

interface LoanCardProps {
  loan: any;
  borrowedLoans: any[];
  lentLoans: any[];
  onAction: (loan: any, action: string) => void;
}

export function LoanCard({
  loan,
  borrowedLoans,
  lentLoans,
  onAction,
}: LoanCardProps) {
  // Determine if current user is borrower or lender
  const isBorrower = borrowedLoans.some(
    (borrowedLoan) => borrowedLoan.id === loan.id,
  );
  const isLender = lentLoans.some((lentLoan) => lentLoan.id === loan.id);

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <LoanCardContent
        loan={loan}
        isBorrower={isBorrower}
        isLender={isLender}
        showActions={true}
        onAction={onAction}
      />
    </div>
  );
}
