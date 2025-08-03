"use client";

import { Calendar, User, Wrench } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface LoanCardProps {
  loan: any;
  userId: string;
  onAction: (loan: any, action: string) => void;
}

export function LoanCard({ loan, userId, onAction }: LoanCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge color="zinc">Pending</Badge>;
      case "approved":
        return <Badge color="green">Approved</Badge>;
      case "active":
        return <Badge color="blue">Active</Badge>;
      case "overdue":
        return <Badge color="red">Overdue</Badge>;
      default:
        return <Badge color="zinc">{status}</Badge>;
    }
  };

  const getActionButton = (loan: any) => {
    const isLender = loan.lender_id === userId;
    const isBorrower = loan.borrower_id === userId;

    if (isLender && loan.status === "pending") {
      return (
        <div className="flex gap-2">
          <Button onClick={() => onAction(loan, "approve")}>Approve</Button>
          <Button outline onClick={() => onAction(loan, "deny")}>
            Deny
          </Button>
        </div>
      );
    }

    if (isBorrower && loan.status === "approved") {
      return (
        <Button onClick={() => onAction(loan, "return")}>Return Tool</Button>
      );
    }

    return null;
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

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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

          {/* Action Buttons */}
          {getActionButton(loan)}
        </div>
      </div>
    </div>
  );
}
