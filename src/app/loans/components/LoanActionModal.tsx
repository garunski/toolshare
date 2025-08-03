"use client";

import { X } from "lucide-react";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";

import { LoanActionForm } from "./LoanActionForm";

interface LoanActionModalProps {
  loan: any;
  isOpen: boolean;
  onClose: () => void;
}

export function LoanActionModal({
  loan,
  isOpen,
  onClose,
}: LoanActionModalProps) {
  if (!isOpen || !loan) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={3} className="text-lg font-semibold">
            Loan Action
          </Heading>
          <Button plain onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <LoanActionForm loan={loan} onSubmit={onClose} />
        </div>
      </div>
    </div>
  );
}
