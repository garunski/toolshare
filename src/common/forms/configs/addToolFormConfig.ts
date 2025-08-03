import { FormConfig } from "../FormBuilder";

import {
  toolCategoryField,
  toolConditionField,
  toolDescriptionField,
  toolImagesField,
  toolNameField,
} from "./baseFormConfig";

export const addToolFormConfig: FormConfig = {
  submitText: "Create Tool",
  loadingText: "Creating...",
  endpoint: "/api/tools",
  method: "POST",
  containerClassName:
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
  fields: [
    toolNameField,
    toolDescriptionField,
    toolCategoryField,
    toolConditionField,
    toolImagesField,
  ],
};
