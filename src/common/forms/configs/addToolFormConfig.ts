import { FormConfig } from "../FormBuilder";
import {
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from "../validators";

export const addToolFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      type: "text",
      label: "Tool Name",
      placeholder: "Enter tool name",
      required: true,
      validate: (value) => {
        const required = requiredValidator(value);
        if (required) return required;
        const minLength = minLengthValidator(2)(value);
        if (minLength) return minLength;
        const maxLength = maxLengthValidator(100)(value);
        if (maxLength) return maxLength;
        return undefined;
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      placeholder: "Describe your tool",
      required: true,
      rows: 4,
      validate: (value) => {
        const required = requiredValidator(value);
        if (required) return required;
        const minLength = minLengthValidator(10)(value);
        if (minLength) return minLength;
        const maxLength = maxLengthValidator(500)(value);
        if (maxLength) return maxLength;
        return undefined;
      },
    },
    {
      name: "category",
      type: "select",
      label: "Category",
      placeholder: "Select a category",
      required: true,
      options: [
        { value: "hand-tools", label: "Hand Tools" },
        { value: "power-tools", label: "Power Tools" },
        { value: "garden-tools", label: "Garden Tools" },
        { value: "automotive", label: "Automotive" },
        { value: "electronics", label: "Electronics" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "condition",
      type: "select",
      label: "Condition",
      placeholder: "Select condition",
      required: true,
      options: [
        { value: "excellent", label: "Excellent" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    {
      name: "images",
      type: "file",
      label: "Images",
      placeholder: "Upload tool images",
      accept: "image/*",
      multiple: true,
      validate: (value) => {
        // File validation logic
        return undefined;
      },
    },
  ],
  submitText: "Create Tool",
  loadingText: "Creating...",
  endpoint: "/api/tools",
  method: "POST",
  containerClassName:
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
