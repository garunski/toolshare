"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";
import { Switch } from "@/primitives/switch";
import { Textarea } from "@/primitives/textarea";

import { DatePicker } from "./DatePicker";
import { MultiSelect } from "./MultiSelect";

interface AttributeDefinitionWithOptions {
  id: string;
  name: string;
  display_label: string;
  data_type:
    | "text"
    | "number"
    | "boolean"
    | "date"
    | "select"
    | "multi_select"
    | "url"
    | "email";
  is_required: boolean;
  validation_rules?: Record<string, any>;
  default_value?: string;
  options?: Record<string, any>;
  display_order: number;
  help_text?: string;
  parsedOptions?: Array<{ value: string; label: string }>;
}

interface Props {
  attribute: AttributeDefinitionWithOptions;
  className?: string;
}

export function DynamicField({ attribute, className }: Props) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();
  const fieldValue = watch(attribute.name);
  const error = errors[attribute.name]?.message as string;

  const renderField = () => {
    const commonProps = {
      error,
      placeholder:
        attribute.help_text || `Enter ${attribute.display_label.toLowerCase()}`,
      ...register(attribute.name, {
        valueAsNumber: attribute.data_type === "number",
      }),
    };

    switch (attribute.data_type) {
      case "text":
        if (
          attribute.validation_rules?.max_length &&
          attribute.validation_rules.max_length > 100
        ) {
          return (
            <Textarea
              {...commonProps}
              rows={4}
              maxLength={attribute.validation_rules.max_length}
            />
          );
        }
        return (
          <Input
            {...commonProps}
            maxLength={attribute.validation_rules?.max_length}
          />
        );

      case "email":
        return <Input {...commonProps} type="email" />;

      case "url":
        return <Input {...commonProps} type="url" />;

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            min={attribute.validation_rules?.min_value}
            max={attribute.validation_rules?.max_value}
            step={attribute.validation_rules?.step || "any"}
          />
        );

      case "date":
        return (
          <DatePicker
            value={fieldValue}
            onChange={(date) => setValue(attribute.name, date)}
            error={error}
            placeholder={attribute.help_text}
            minDate={attribute.validation_rules?.min_date}
            maxDate={attribute.validation_rules?.max_date}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-3">
            <Switch
              checked={fieldValue || false}
              onChange={(checked) => setValue(attribute.name, checked)}
            />
            <span className="text-sm text-gray-600">
              {attribute.help_text || "Enable this option"}
            </span>
          </div>
        );

      case "select":
        return (
          <Select {...commonProps}>
            <option value="">Select an option</option>
            {attribute.parsedOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case "multi_select":
        return (
          <MultiSelect
            options={attribute.parsedOptions || []}
            value={fieldValue || []}
            onChange={(values) => setValue(attribute.name, values)}
            error={error}
            placeholder={attribute.help_text}
            maxSelections={attribute.validation_rules?.max_selections}
          />
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {attribute.display_label}
        {attribute.is_required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {renderField()}

      {attribute.help_text && !error && (
        <p className="mt-1 text-xs text-gray-500">{attribute.help_text}</p>
      )}

      {attribute.default_value && !fieldValue && (
        <p className="mt-1 text-xs text-blue-600">
          Default: {attribute.default_value}
        </p>
      )}

      {/* Character count for text fields */}
      {attribute.data_type === "text" &&
        attribute.validation_rules?.max_length &&
        fieldValue && (
          <p className="mt-1 text-right text-xs text-gray-500">
            {String(fieldValue).length} /{" "}
            {attribute.validation_rules.max_length}
          </p>
        )}

      {/* Validation message */}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
