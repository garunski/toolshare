"use client";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { AddToolFormSteps } from "./AddToolFormSteps";
import { useAddToolForm } from "./useAddToolForm";

interface AddToolFormProps {
  userId: string;
  onSuccess: () => void;
}

export function AddToolForm({ userId, onSuccess }: AddToolFormProps) {
  const {
    form,
    currentStep,
    isLoading,
    error,
    uploadedImages,
    steps,
    currentStepIndex,
    nextStep,
    prevStep,
    handleImageUpload,
    handleSubmit,
  } = useAddToolForm(userId, onSuccess);

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
        <div>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        index <= currentStepIndex
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-4 h-px w-8 ${
                          index < currentStepIndex
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <AddToolFormSteps
              currentStep={currentStep}
              form={form}
              uploadedImages={uploadedImages}
              onImageUpload={handleImageUpload}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                outline
                onClick={prevStep}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentStepIndex < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Tool"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
