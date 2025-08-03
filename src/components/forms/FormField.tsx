"use client";

import { Input } from "@/primitives/input";
import { Textarea } from "@/primitives/textarea";
import { Select } from "@/primitives/select";
import { Checkbox } from "@/primitives/checkbox";

export interface FormField {
  name: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "file" | "checkbox" | "date";
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

function renderTextarea(field: FormField, value: string, isLoading: boolean, onChange: (value: string) => void, onBlur: () => void, inputClass: string, error?: string) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.placeholder}
      disabled={isLoading}
      className={inputClass}
      rows={field.rows || 3}
      aria-invalid={!!error}
    />
  );
}

function renderSelect(field: FormField, value: string, isLoading: boolean, onChange: (value: string) => void, onBlur: () => void, inputClass: string, error?: string) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={isLoading}
      className={inputClass}
      aria-invalid={!!error}
    >
      <option value="">{field.placeholder}</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

function renderCheckbox(field: FormField, value: string, isLoading: boolean, onChange: (value: string) => void, onBlur: () => void, inputClass: string, error?: string) {
  return (
    <Checkbox
      checked={value === "true"}
      onChange={(checked) => onChange(checked ? "true" : "false")}
      onBlur={onBlur}
      disabled={isLoading}
      className={inputClass}
      aria-invalid={!!error}
    />
  );
}

function renderFileInput(field: FormField, isLoading: boolean, onChange: (value: string) => void, onBlur: () => void, inputClass: string, error?: string) {
  return (
    <Input
      type="file"
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          // For file inputs, we'll store the file name or handle files differently
          onChange(files[0].name);
        }
      }}
      onBlur={onBlur}
      disabled={isLoading}
      className={inputClass}
      accept={field.accept}
      multiple={field.multiple}
      aria-invalid={!!error}
    />
  );
}

function renderDefaultInput(field: FormField, value: string, isLoading: boolean, onChange: (value: string) => void, onBlur: () => void, inputClass: string, error?: string) {
  return (
    <Input
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.placeholder}
      disabled={isLoading}
      className={inputClass}
      min={field.min}
      max={field.max}
      step={field.step}
      aria-invalid={!!error}
    />
  );
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
  const isHorizontal = layout === "horizontal";
  const containerClass = isHorizontal ? "flex-1" : "";
  const inputClass = field.className || (isHorizontal ? "flex-1" : "");

  const renderInput = () => {
    if (field.type === "textarea") {
      return renderTextarea(field, value, isLoading, onChange, onBlur, inputClass, error);
    }

    if (field.type === "select") {
      return renderSelect(field, value, isLoading, onChange, onBlur, inputClass, error);
    }

    if (field.type === "checkbox") {
      return renderCheckbox(field, value, isLoading, onChange, onBlur, inputClass, error);
    }

    if (field.type === "file") {
      return renderFileInput(field, isLoading, onChange, onBlur, inputClass, error);
    }

    return renderDefaultInput(field, value, isLoading, onChange, onBlur, inputClass, error);
  };

  return (
    <div className={containerClass}>
      {field.label && (
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
} 