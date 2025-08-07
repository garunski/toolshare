import { FormConfig } from "../FormBuilder";
import { requiredValidator } from "../validators";

import {
  optionalTextareaField,
  toolConditionField,
  toolDescriptionField,
  toolImagesField,
  toolNameField,
} from "./baseFormConfig";

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
      submitText: "Next",
      loadingText: "Processing...",
      endpoint: "", // Will be handled by MultiStepFormBuilder
      fields: [toolNameField, toolDescriptionField],
    },
  },
  {
    key: "details",
    title: "Details",
    description: "Category and condition",
    config: {
      submitText: "Next",
      loadingText: "Processing...",
      endpoint: "", // Will be handled by MultiStepFormBuilder
      fields: [
        {
          name: "category",
          type: "select" as const,
          label: "Category",
          placeholder: "Select a category",
          required: true,
          validate: requiredValidator,
          // This will be populated dynamically by the form component
          options: [],
        },
        toolConditionField,
        {
          name: "location",
          type: "text" as const,
          label: "Location",
          placeholder: "Where is the tool located?",
          required: true,
          validate: requiredValidator,
        },
      ],
    },
  },
  {
    key: "images",
    title: "Images",
    description: "Upload tool photos",
    config: {
      submitText: "Create Tool",
      loadingText: "Creating...",
      endpoint: "/api/tools",
      method: "POST",
      fields: [
        {
          ...toolImagesField,
          label: "Tool Images",
        },
        optionalTextareaField(
          "notes",
          "Additional Notes",
          "Any additional information about the tool",
          300,
          3,
        ),
      ],
    },
  },
];
