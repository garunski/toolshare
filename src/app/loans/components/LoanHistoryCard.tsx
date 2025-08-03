"use client";

import { Calendar, User, Wrench } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface LoanHistoryCardProps {
  loan: any;
  userId: string;
}

export function LoanHistoryCard({ loan, userId }: LoanHistoryCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "returned":
        return <Badge color="zinc">Returned</Badge>;
      case "denied":
        return <Badge color="red">Denied</Badge>;
      default:
        return <Badge color="zinc">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-start gap-4">
        {/* Tool Image */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
          {loan.tools?.images?.[0] ? (
            <Image
              src={loan.tools.images[0]}
              alt={loan.tools.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Wrench className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Loan Details */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <Heading
                level={3}
                className="font-semibold text-gray-900 dark:text-white"
              >
                {loan.tools?.name}
              </Heading>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {loan.tools?.description}
              </Text>
            </div>
            {getStatusBadge(loan.status)}
          </div>

          <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(loan.start_date).toLocaleDateString()} -{" "}
                {new Date(loan.end_date).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>
                {loan.lender_id === userId
                  ? `Borrower: ${loan.profiles?.first_name} ${loan.profiles?.last_name}`
                  : `Lender: ${loan.profiles?.first_name} ${loan.profiles?.last_name}`}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Completed: {new Date(loan.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
