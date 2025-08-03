"use client";

import { Checkbox } from "@/primitives/checkbox";
import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";
import { Textarea } from "@/primitives/textarea";

import type { FormField } from "./FormField";

export function renderTextarea(
  field: FormField,
  value: string,
  isLoading: boolean,
  onChange: (value: string) => void,
  onBlur: () => void,
  inputClass: string,
  error?: string,
) {
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

export function renderSelect(
  field: FormField,
  value: string,
  isLoading: boolean,
  onChange: (value: string) => void,
  onBlur: () => void,
  inputClass: string,
  error?: string,
) {
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

export function renderCheckbox(
  field: FormField,
  value: string,
  isLoading: boolean,
  onChange: (value: string) => void,
  onBlur: () => void,
  inputClass: string,
  error?: string,
) {
  const isChecked = value === "true";
  return (
    <Checkbox
      checked={isChecked}
      onChange={(checked) => onChange(checked.toString())}
      onBlur={onBlur}
      disabled={isLoading}
      className={inputClass}
      aria-invalid={!!error}
    />
  );
}

export function renderFileInput(
  field: FormField,
  isLoading: boolean,
  onChange: (value: string) => void,
  onBlur: () => void,
  inputClass: string,
  error?: string,
) {
  return (
    <Input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        onChange(file ? file.name : "");
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

export function renderDefaultInput(
  field: FormField,
  value: string,
  isLoading: boolean,
  onChange: (value: string) => void,
  onBlur: () => void,
  inputClass: string,
  error?: string,
) {
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
