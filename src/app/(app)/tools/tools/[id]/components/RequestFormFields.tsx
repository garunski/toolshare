"use client";

import { UseFormReturn } from "react-hook-form";

import { BorrowingRequest } from "@/common/validators/borrowingRequestValidator";
import { Input } from "@/primitives/input";
import { Text } from "@/primitives/text";
import { Textarea } from "@/primitives/textarea";

interface RequestFormFieldsProps {
  form: UseFormReturn<BorrowingRequest>;
}

export function RequestFormFields({ form }: RequestFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          Start Date
        </label>
        <Input
          type="date"
          {...form.register("start_date")}
          value={
            form.watch("start_date") instanceof Date
              ? form.watch("start_date").toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            form.setValue("start_date", new Date(e.target.value))
          }
        />
        {form.formState.errors.start_date && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.start_date.message}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          End Date
        </label>
        <Input
          type="date"
          {...form.register("end_date")}
          value={
            form.watch("end_date") instanceof Date
              ? form.watch("end_date").toISOString().split("T")[0]
              : ""
          }
          onChange={(e) => form.setValue("end_date", new Date(e.target.value))}
        />
        {form.formState.errors.end_date && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.end_date.message}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          Message to Owner
        </label>
        <Textarea
          placeholder="Tell the owner why you need this tool..."
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.message.message}
          </Text>
        )}
      </div>
    </>
  );
}
