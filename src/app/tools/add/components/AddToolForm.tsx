"use client";

import { useRouter } from "next/navigation";

import { MultiStepFormBuilder } from "@/common/forms";
import { addToolFormSteps } from "@/common/forms/configs/addToolFormSteps";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface AddToolFormProps {
  userId: string;
  onSuccess: () => void;
}

export function AddToolForm({ userId, onSuccess }: AddToolFormProps) {
  const router = useRouter();

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
          steps={addToolFormSteps}
          onComplete={handleComplete}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
