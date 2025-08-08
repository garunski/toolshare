"use client";

import Image from "next/image";
import { UseFormReturn } from "react-hook-form";

import type { ToolCreationData } from "@/app/tools/tools/add/validation";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface ReviewStepProps {
  form: UseFormReturn<ToolCreationData>;
  uploadedImages: string[];
}

export function ReviewStep({ form, uploadedImages }: ReviewStepProps) {
  const formData = form.getValues();

  const formatPrice = (price?: number) => {
    if (!price) return "Not specified";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Review Your Tool
        </h3>
        <p className="text-sm text-gray-600">
          Please review all the information before submitting. You can go back
          to make changes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4">
            <Heading level={3} className="text-lg font-semibold">
              Basic Information
            </Heading>
          </div>
          <div className="space-y-3">
            <div>
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name:
              </Text>
              <Text className="text-sm">{formData.name}</Text>
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Category:
              </Text>
              <Text className="text-sm">{formData.category}</Text>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4">
            <Heading level={3} className="text-lg font-semibold">
              Details
            </Heading>
          </div>
          <div className="space-y-3">
            <div>
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Condition:
              </Text>
              <Text className="text-sm capitalize">{formData.condition}</Text>
            </div>

            <div>
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Available:
              </Text>
              <Text className="text-sm">
                {formData.is_available ? "Yes" : "No"}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Description
          </Heading>
        </div>
        <div>
          <Text className="text-sm text-gray-700 dark:text-gray-300">
            {formData.description}
          </Text>
        </div>
      </div>

      {/* Images */}
      {uploadedImages.length > 0 && (
        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4">
            <Heading level={3} className="text-lg font-semibold">
              Images ({uploadedImages.length})
            </Heading>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {uploadedImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800"
                >
                  <Image
                    src={imageUrl}
                    alt={`Tool image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation */}
      <div className="rounded-lg bg-green-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-green-900">
          Ready to Submit
        </h4>
        <p className="text-sm text-green-800">
          Your tool will be added to the community and available for borrowing.
          You can edit or remove it anytime from your tools page.
        </p>
      </div>
    </div>
  );
}
