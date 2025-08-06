"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { MultiStepFormBuilder } from "@/common/forms";
import { addToolFormSteps } from "@/common/forms/configs/addToolFormSteps";
import { useCategories } from "@/common/hooks/useCategories";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface AddToolFormProps {
  userId: string;
  onSuccess: () => void;
}

export function AddToolForm({ userId, onSuccess }: AddToolFormProps) {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();

  // Convert category tree to flat options for select
  const categoryOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    const addCategory = (category: any, level = 0) => {
      const indent = "  ".repeat(level);
      options.push({
        value: category.id,
        label: `${indent}${category.name}`,
      });

      if (category.children && category.children.length > 0) {
        category.children.forEach((child: any) =>
          addCategory(child, level + 1),
        );
      }
    };

    categories.forEach((category) => addCategory(category));
    return options;
  }, [categories]);

  // Create dynamic form steps with populated category options
  const dynamicFormSteps = useMemo(() => {
    return addToolFormSteps.map((step) => {
      if (step.key === "details") {
        return {
          ...step,
          config: {
            ...step.config,
            fields: step.config.fields.map((field) => {
              if (field.name === "category") {
                return {
                  ...field,
                  options: categoryOptions,
                  placeholder: categoriesLoading
                    ? "Loading categories..."
                    : "Select a category",
                  disabled: categoriesLoading,
                };
              }
              return field;
            }),
          },
        };
      }
      return step;
    });
  }, [categoryOptions, categoriesLoading]);

  const handleComplete = async (allData: Record<string, string>) => {
    try {
      // Handle the complete form data
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...allData, userId }),
      });

      if (response.ok) {
        onSuccess();
        router.push("/tools");
      } else {
        throw new Error("Failed to create tool");
      }
    } catch (error) {
      console.error("Failed to create tool:", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-6">
          <Heading level={2} className="text-xl font-semibold">
            Add New Tool
          </Heading>
          <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Share your tools with the community
          </Text>
        </div>

        <MultiStepFormBuilder
          steps={dynamicFormSteps}
          onComplete={handleComplete}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
