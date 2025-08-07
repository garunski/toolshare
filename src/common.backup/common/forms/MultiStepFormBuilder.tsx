"use client";

import { useState } from "react";

import { Button } from "@/primitives/button";

import { FormBuilder, type FormConfig } from "./FormBuilder";

interface Step {
  key: string;
  title: string;
  description: string;
  config: FormConfig;
}

interface MultiStepFormBuilderProps {
  steps: Step[];
  onComplete: (allData: Record<string, string>) => void;
  onCancel?: () => void;
}

export function MultiStepFormBuilder({
  steps,
  onComplete,
  onCancel,
}: MultiStepFormBuilderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleStepSuccess = (
    data: unknown,
    stepData: Record<string, string> | undefined,
  ) => {
    const newFormData = { ...formData, ...(stepData || {}) };
    setFormData(newFormData);

    if (isLastStep) {
      onComplete(newFormData);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
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
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-px w-8 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Form */}
      <FormBuilder
        config={{
          ...currentStep.config,
          onSuccess: handleStepSuccess,
          onCancel,
          initialValues: formData,
        }}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          plain
        >
          Previous
        </Button>
      </div>
    </div>
  );
}
