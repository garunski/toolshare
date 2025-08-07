"use client";

import { Wrench } from "lucide-react";
import { useState } from "react";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { LoanActionModal } from "./LoanActionModal";
import { LoanCard } from "./LoanCard";

interface ActiveLoansListProps {
  loans: any[];
  userId: string;
}

export function ActiveLoansList({ loans, userId }: ActiveLoansListProps) {
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const handleLoanAction = (loan: any, action: string) => {
    setSelectedLoan({ ...loan, action });
    setShowActionModal(true);
  };

  if (loans.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-col items-center justify-center py-12">
          <Wrench className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
          <Heading
            level={3}
            className="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
          >
            No active loans
          </Heading>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            You don&apos;t have any active loans or pending requests at the
            moment.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <LoanCard
          key={loan.id}
          loan={loan}
          userId={userId}
          onAction={handleLoanAction}
        />
      ))}

      <LoanActionModal
        loan={selectedLoan}
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedLoan(null);
        }}
      />
    </div>
  );
}
