"use client";

import { LoanCardContent } from "./shared/LoanCardContent";

interface LoanHistoryCardProps {
  loan: any;
}

export function LoanHistoryCard({ loan }: LoanHistoryCardProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <LoanCardContent loan={loan} showActions={false}>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Completed: {new Date(loan.updated_at).toLocaleDateString()}
        </div>
      </LoanCardContent>
    </div>
  );
}
