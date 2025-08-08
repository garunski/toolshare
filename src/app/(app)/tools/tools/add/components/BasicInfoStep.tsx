"use client";

import { UseFormReturn } from "react-hook-form";

import type { ToolCreationData } from "@/app/tools/tools/add/validation";
import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";
import { Text } from "@/primitives/text";

interface BasicInfoStepProps {
  form: UseFormReturn<ToolCreationData>;
}

const categories = [
  "Power Tools",
  "Hand Tools",
  "Garden Tools",
  "Automotive",
  "Cleaning",
  "Ladders & Scaffolding",
  "Safety Equipment",
  "Other",
];

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900 dark:text-white">
            Tool Name *
          </label>
          <Input
            placeholder="e.g., Cordless Drill"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <Text className="text-sm text-red-600">
              {form.formState.errors.name.message}
            </Text>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900 dark:text-white">
            Category *
          </label>
          <Select
            onChange={(e) => form.setValue("category", e.target.value as any)}
            value={form.watch("category") || ""}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          {form.formState.errors.category && (
            <Text className="text-sm text-red-600">
              {form.formState.errors.category.message}
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
