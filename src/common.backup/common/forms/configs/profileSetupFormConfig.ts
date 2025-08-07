import { FormConfig } from "../FormBuilder";

import {
  nameFields,
  optionalPhoneField,
  optionalTextareaField,
} from "./baseFormConfig";

export const profileSetupFormConfig: FormConfig = {
  submitText: "Complete Setup",
  loadingText: "Saving profile...",
  endpoint: "/api/profiles",
  method: "POST",
  containerClassName:
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
  fields: [
    ...nameFields,
    optionalPhoneField,
    optionalTextareaField(
      "address",
      "Address",
      "Enter your address (optional)",
      200,
      3,
    ),
    optionalTextareaField(
      "bio",
      "Bio",
      "Tell us about yourself (optional)",
      500,
      4,
    ),
  ],
};
