"use client";

import { UseFormReturn } from "react-hook-form";

import type { ToolCreationData } from "@/app/tools/tools/add/validation";
import { Select } from "@/primitives/select";
import { Text } from "@/primitives/text";
import { Textarea } from "@/primitives/textarea";

interface DetailsStepProps {
  form: UseFormReturn<ToolCreationData>;
}

const conditions = [
  { value: "excellent", label: "Excellent - Like new" },
  { value: "good", label: "Good - Minor wear" },
  { value: "fair", label: "Fair - Some wear" },
  { value: "poor", label: "Poor - Significant wear" },
];

export function DetailsStep({ form }: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          Description *
        </label>
        <Textarea
          placeholder="Describe your tool, its features, and any important details..."
          className="min-h-[100px]"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.description.message}
          </Text>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900 dark:text-white">
            Condition *
          </label>
          <Select
            onChange={(e) => form.setValue("condition", e.target.value as any)}
            value={form.watch("condition") || ""}
          >
            <option value="">Select condition</option>
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </Select>
          {form.formState.errors.condition && (
            <Text className="text-sm text-red-600">
              {form.formState.errors.condition.message}
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
