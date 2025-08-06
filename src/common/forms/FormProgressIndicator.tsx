"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";

import { Badge } from "@/primitives/badge";

import { FormUtils } from "./FormStateManager";

interface Props {
  totalFields: number;
  filledFields: number;
  requiredFields?: number;
  showDetails?: boolean;
}

export function FormProgressIndicator({
  totalFields,
  filledFields,
  requiredFields,
  showDetails = true,
}: Props) {
  const progress = useMemo(() => {
    return FormUtils.calculateCompletionPercentage(totalFields, filledFields);
  }, [totalFields, filledFields]);

  const progressColor = useMemo(() => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  }, [progress]);

  const textColor = useMemo(() => {
    if (progress === 100) return "text-green-700";
    if (progress >= 75) return "text-blue-700";
    if (progress >= 50) return "text-yellow-700";
    return "text-gray-600";
  }, [progress]);

  if (totalFields === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {progress === 100 && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
          <span className={`font-medium ${textColor}`}>
            {progress === 100 ? "Form Complete!" : "Form Progress"}
          </span>
        </div>

        <Badge color="zinc" className={textColor}>
          {filledFields} / {totalFields} fields
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{progress}% complete</span>

          {requiredFields && requiredFields > 0 && (
            <span>
              {Math.min(filledFields, requiredFields)} / {requiredFields}{" "}
              required fields
            </span>
          )}
        </div>
      )}

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            🎉 All fields have been completed! You can now submit the form.
          </p>
        </div>
      )}

      {/* Encouragement Messages */}
      {progress > 0 && progress < 100 && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            {progress >= 75
              ? "You're almost done! Just a few more fields to go."
              : progress >= 50
                ? "Great progress! You're halfway there."
                : progress >= 25
                  ? "Good start! Keep going to complete your form."
                  : "Fill out the fields below to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
