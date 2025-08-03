"use client";

import { Text } from "@/primitives/text";

import {
  renderCheckbox,
  renderDefaultInput,
  renderFileInput,
  renderSelect,
  renderTextarea,
} from "./FormFieldRenderers";

export interface FormField {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "file"
    | "checkbox"
    | "date";
  placeholder: string;
  label?: string;
  required?: boolean;
  className?: string;
  rows?: number;
  options?: Array<{ value: string; label: string }>; // For select fields
  validate?: (
    value: string,
    allValues?: Record<string, string>,
  ) => string | undefined;
  accept?: string; // For file inputs
  multiple?: boolean; // For file inputs
  min?: number; // For number inputs
  max?: number; // For number inputs
  step?: number; // For number inputs
}

interface FormFieldProps {
  field: FormField;
  value: string;
  error?: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  layout?: "horizontal" | "vertical";
}

export function FormField({
  field,
  value,
  error,
  isLoading,
  onChange,
  onBlur,
  layout = "vertical",
}: FormFieldProps) {
  const inputClass = `w-full ${error ? "border-red-500" : ""} ${field.className || ""}`;

  const renderInput = () => {
    switch (field.type) {
      case "textarea":
        return renderTextarea(
          field,
          value,
          isLoading,
          onChange,
          onBlur,
          inputClass,
          error,
        );
      case "select":
        return renderSelect(
          field,
          value,
          isLoading,
          onChange,
          onBlur,
          inputClass,
          error,
        );
      case "checkbox":
        return renderCheckbox(
          field,
          value,
          isLoading,
          onChange,
          onBlur,
          inputClass,
          error,
        );
      case "file":
        return renderFileInput(
          field,
          isLoading,
          onChange,
          onBlur,
          inputClass,
          error,
        );
      default:
        return renderDefaultInput(
          field,
          value,
          isLoading,
          onChange,
          onBlur,
          inputClass,
          error,
        );
    }
  };

  if (layout === "horizontal") {
    return (
      <div className="flex items-center space-x-4">
        {field.label && (
          <label className="w-1/3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="flex-1">
          {renderInput()}
          {error && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </Text>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {field.label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>
      )}
    </div>
  );
}
