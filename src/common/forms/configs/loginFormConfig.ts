import { FormConfig } from "../FormBuilder";
import { emailValidator } from "../validators";

export const loginFormConfig: FormConfig = {
  fields: [
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email address",
      required: true,
      validate: emailValidator,
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      required: true,
    },
  ],
  submitText: "Sign In",
  loadingText: "Signing in...",
  endpoint: "auth/signIn",
  containerClassName:
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
