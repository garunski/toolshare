"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  type BorrowingRequestData,
  borrowingRequestSchema,
} from "@/app/tools/tools/[id]/validation";
import { useAuth } from "@/common/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Tool } from "@/types/tool";

import { RequestFormFields } from "./RequestFormFields";
import { submitLoanRequest } from "./RequestFormHelpers";

interface RequestFormProps {
  tool: Tool & {
    profiles: {
      id: string;
      first_name: string;
      last_name: string;
      bio: string | null;
    };
  };
  onSubmit: () => void;
}

export function RequestForm({ tool, onSubmit }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<BorrowingRequestData>({
    resolver: zodResolver(borrowingRequestSchema),
    defaultValues: {
      tool_id: tool.id,
      start_date: new Date(),
      end_date: new Date(),
      message: "",
    },
  });

  const handleSubmit = async (data: BorrowingRequestData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await submitLoanRequest(data, user.id, tool);
      form.reset();
      onSubmit();
    } catch (error) {
      console.error("Failed to submit request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold">{tool.name}</h3>
      <p className="text-sm text-gray-600">
        Owner: {tool.profiles.first_name} {tool.profiles.last_name}
      </p>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <RequestFormFields form={form} />

        <div className="flex gap-2 pt-4">
          <Button type="button" outline onClick={onSubmit} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
