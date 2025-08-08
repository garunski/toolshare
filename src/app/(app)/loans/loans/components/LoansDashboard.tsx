"use client";

import { useState } from "react";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { ActiveLoansList } from "./ActiveLoansList";
import { LoanHistoryList } from "./LoanHistoryList";
import { LoanSummaryCards } from "./LoanSummaryCards";

interface LoansDashboardProps {
  activeLoans: any[];
  borrowedLoans: any[];
  lentLoans: any[];
  stats: {
    active: number;
    completed: number;
    pending: number;
  };
}

export function LoansDashboard({
  activeLoans,
  borrowedLoans,
  lentLoans,
  stats,
}: LoansDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("active");

  const pendingLoans = activeLoans.filter((loan) => loan.status === "pending");
  const activeLoansList = activeLoans.filter((loan) =>
    ["approved", "active", "overdue"].includes(loan.status),
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Heading
          level={1}
          className="mb-2 text-3xl font-bold text-gray-900 dark:text-white"
        >
          My Loans
        </Heading>
        <Text className="text-gray-600 dark:text-gray-400">
          Manage your borrowing and lending activity
        </Text>
      </div>

      <LoanSummaryCards
        pendingLoans={pendingLoans}
        activeLoansList={activeLoansList}
        activeLoans={activeLoans}
        stats={stats}
      />

      {/* Tabs */}
      <div className="mt-6">
        <div className="mb-4 flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setSelectedTab("active")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              selectedTab === "active"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setSelectedTab("pending")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              selectedTab === "pending"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setSelectedTab("history")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              selectedTab === "history"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Loan History
          </button>
        </div>

        {selectedTab === "active" && (
          <div className="mt-6">
            <ActiveLoansList
              loans={activeLoansList}
              borrowedLoans={borrowedLoans}
              lentLoans={lentLoans}
            />
          </div>
        )}

        {selectedTab === "pending" && (
          <div className="mt-6">
            <ActiveLoansList
              loans={pendingLoans}
              borrowedLoans={borrowedLoans}
              lentLoans={lentLoans}
            />
          </div>
        )}

        {selectedTab === "history" && (
          <div className="mt-6">
            <LoanHistoryList
              borrowedLoans={borrowedLoans}
              lentLoans={lentLoans}
            />
          </div>
        )}
      </div>
    </div>
  );
}
