"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  processLoanReturn,
  trackLoanStatus,
} from "@/app/loans/operations/loanTrackingOperationsClient";
import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";
import { Textarea } from "@/primitives/textarea";

import { getActionButtonText, getActionDescription } from "./LoanActionHelpers";

const actionMessageSchema = z.object({
  message: z.string().optional(),
});

type ActionMessage = z.infer<typeof actionMessageSchema>;

interface LoanActionFormProps {
  loan: any;
  onSubmit: () => void;
}

export function LoanActionForm({ loan, onSubmit }: LoanActionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ActionMessage>({
    resolver: zodResolver(actionMessageSchema),
  });

  const handleSubmit = async (data: ActionMessage) => {
    if (!loan) return;

    setIsSubmitting(true);
    try {
      switch (loan.action) {
        case "approve":
          await trackLoanStatus({
            loan_id: loan.id,
            status: "approved",
            message: data.message,
          });
          break;
        case "deny":
          await trackLoanStatus({
            loan_id: loan.id,
            status: "denied",
            message: data.message,
          });
          break;
        case "return":
          await processLoanReturn({
            loan_id: loan.id,
            condition_notes: data.message,
          });
          break;
      }

      form.reset();
      onSubmit();
      // Refresh the page to update the loan list
      window.location.reload();
    } catch (error) {
      console.error("Failed to process loan action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold">{loan.tools?.name}</h3>
      <p className="text-sm text-gray-600">
        {getActionDescription(loan?.action)}
      </p>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900 dark:text-white">
            {loan.action === "return"
              ? "Condition Notes"
              : "Message (Optional)"}
          </label>
          <Textarea
            placeholder={
              loan.action === "return"
                ? "Describe the condition of the tool..."
                : "Add a message..."
            }
            {...form.register("message")}
          />
          {form.formState.errors.message && (
            <Text className="text-sm text-red-600">
              {form.formState.errors.message.message}
            </Text>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" outline onClick={onSubmit} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            color={loan.action === "deny" ? "red" : "dark/zinc"}
            className="flex-1"
          >
            {getActionButtonText(loan?.action, isSubmitting)}
          </Button>
        </div>
      </form>
    </div>
  );
}
