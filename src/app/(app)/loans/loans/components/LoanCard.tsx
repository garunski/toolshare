"use client";

import { LoanCardContent } from "./shared/LoanCardContent";

interface LoanCardProps {
  loan: any;
  userId: string;
  onAction: (loan: any, action: string) => void;
}

export function LoanCard({ loan, userId, onAction }: LoanCardProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <LoanCardContent
        loan={loan}
        userId={userId}
        showActions={true}
        onAction={onAction}
      />
    </div>
  );
}
