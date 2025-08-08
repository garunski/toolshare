"use client";

import { useRouter } from "next/navigation";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { FormActions } from "./FormActions";
import { ToolCategoryField } from "./ToolCategoryField";
import { ToolConditionField } from "./ToolConditionField";
import { ToolDescriptionField } from "./ToolDescriptionField";
import { ToolLocationField } from "./ToolLocationField";
import { ToolNameField } from "./ToolNameField";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  children?: Category[];
}

interface AddToolFormProps {
  categories: Category[];
  categoryOptions: Array<{ value: string; label: string }>;
  onSuccess: () => void;
}

export function AddToolForm({
  categories,
  categoryOptions,
  onSuccess,
}: AddToolFormProps) {
  const router = useRouter();

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const allData = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allData),
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

        <form className="space-y-6" onSubmit={handleComplete}>
          <ToolNameField />
          <ToolDescriptionField />
          <ToolCategoryField
            categoryOptions={categoryOptions}
            categoriesLoading={false}
          />
          <ToolConditionField />
          <ToolLocationField />
          <FormActions onCancel={() => router.back()} />
        </form>
      </div>
    </div>
  );
}
