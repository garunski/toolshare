"use client";

import { Calendar, User, Wrench } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface LoanCardContentProps {
  loan: any;
  isBorrower?: boolean;
  isLender?: boolean;
  showActions?: boolean;
  onAction?: (loan: any, action: string) => void;
  children?: React.ReactNode;
}

export function LoanCardContent({
  loan,
  isBorrower = false,
  isLender = false,
  showActions = false,
  onAction,
  children,
}: LoanCardContentProps) {
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
      case "returned":
        return <Badge color="zinc">Returned</Badge>;
      case "denied":
        return <Badge color="red">Denied</Badge>;
      default:
        return <Badge color="zinc">{status}</Badge>;
    }
  };

  const getActionButton = (loan: any) => {
    if (!showActions || !onAction) return null;

    if (isLender && loan.status === "pending") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction(loan, "approve")}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Approve
          </button>
          <button
            onClick={() => onAction(loan, "deny")}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Deny
          </button>
        </div>
      );
    }

    if (isBorrower && loan.status === "approved") {
      return (
        <button
          onClick={() => onAction(loan, "return")}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Return Tool
        </button>
      );
    }

    return null;
  };

  return (
    <div className="flex items-start gap-4">
      {/* Tool Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
        {loan.items?.image_url ? (
          <Image
            src={loan.items.image_url}
            alt={loan.items.name}
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
              {loan.items?.name}
            </Heading>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {loan.items?.description}
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
              {isLender
                ? `Borrower: ${loan.profiles?.name || "Unknown"}`
                : `Lender: ${loan.profiles?.name || "Unknown"}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {getActionButton(loan)}

        {/* Additional Content */}
        {children}
      </div>
    </div>
  );
}
