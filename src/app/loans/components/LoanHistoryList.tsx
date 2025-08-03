"use client";

import { Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/common/supabase";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { LoanHistoryCard } from "./LoanHistoryCard";

interface LoanHistoryListProps {
  userId: string;
}

export function LoanHistoryList({ userId }: LoanHistoryListProps) {
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoanHistory() {
      const client = supabase;

      const { data, error } = await supabase
        .from("loans")
        .select(
          `
          *,
          tools (
            id,
            name,
            description,
            images
          ),
          profiles!loans_borrower_id_fkey (
            id,
            first_name,
            last_name
          ),
          profiles!loans_lender_id_fkey (
            id,
            first_name,
            last_name
          )
        `,
        )
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
        .eq("status", "returned")
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setLoanHistory(data);
      }
      setLoading(false);
    }

    fetchLoanHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
            <Text className="text-gray-600 dark:text-gray-400">
              Loading loan history...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (loanHistory.length === 0) {
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
      {loanHistory.map((loan) => (
        <LoanHistoryCard key={loan.id} loan={loan} userId={userId} />
      ))}
    </div>
  );
}
