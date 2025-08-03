import { FormConfig } from "../FormBuilder";
import {
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from "../validators";

export const addToolFormSteps: Array<{
  key: string;
  title: string;
  description: string;
  config: FormConfig;
}> = [
  {
    key: "basic-info",
    title: "Basic Information",
    description: "Tool name and description",
    config: {
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
      ],
      submitText: "Next",
      loadingText: "Processing...",
      endpoint: "", // Will be handled by MultiStepFormBuilder
    },
  },
  {
    key: "details",
    title: "Details",
    description: "Category and condition",
    config: {
      fields: [
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
          name: "location",
          type: "text",
          label: "Location",
          placeholder: "Where is the tool located?",
          required: true,
          validate: requiredValidator,
        },
      ],
      submitText: "Next",
      loadingText: "Processing...",
      endpoint: "", // Will be handled by MultiStepFormBuilder
    },
  },
  {
    key: "images",
    title: "Images",
    description: "Upload tool photos",
    config: {
      fields: [
        {
          name: "images",
          type: "file",
          label: "Tool Images",
          placeholder: "Upload tool images",
          accept: "image/*",
          multiple: true,
        },
        {
          name: "notes",
          type: "textarea",
          label: "Additional Notes",
          placeholder: "Any additional information about the tool",
          required: false,
          rows: 3,
          validate: (value) => {
            if (value && value.length > 300) {
              return "Message must be less than 300 characters";
            }
            return undefined;
          },
        },
      ],
      submitText: "Create Tool",
      loadingText: "Creating...",
      endpoint: "/api/tools",
      method: "POST",
    },
  },
];
