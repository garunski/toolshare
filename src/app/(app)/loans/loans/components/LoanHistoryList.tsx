"use client";

import { Wrench } from "lucide-react";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { LoanHistoryCard } from "./LoanHistoryCard";

interface LoanHistoryListProps {
  borrowedLoans: any[];
  lentLoans: any[];
}

export function LoanHistoryList({
  borrowedLoans,
  lentLoans,
}: LoanHistoryListProps) {
  // Filter for completed loans
  const completedLoans = [...borrowedLoans, ...lentLoans].filter(
    (loan) => loan.status === "completed" || loan.status === "returned",
  );

  if (completedLoans.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-col items-center justify-center py-12">
          <Wrench className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
          <Heading
            level={3}
            className="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
          >
            No loan history
          </Heading>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            You haven&apos;t completed any loans yet.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completedLoans.map((loan) => (
        <LoanHistoryCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}
