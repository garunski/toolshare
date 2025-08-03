import { FormConfig } from "../FormBuilder";

import {
  confirmPasswordField,
  emailField,
  nameFields,
  passwordField,
} from "./baseFormConfig";

export const registerFormConfig: FormConfig = {
  submitText: "Create Account",
  loadingText: "Creating account...",
  endpoint: "auth/signUp",
  containerClassName:
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
  fields: [...nameFields, emailField, passwordField, confirmPasswordField],
};
