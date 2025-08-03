import { FormConfig } from "../FormBuilder";
import { emailValidator, passwordValidator, nameValidator } from "../validators";

export const registerFormConfig: FormConfig = {
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "First Name",
      placeholder: "Enter your first name",
      required: true,
      validate: nameValidator,
    },
    {
      name: "lastName",
      type: "text",
      label: "Last Name",
      placeholder: "Enter your last name",
      required: true,
      validate: nameValidator,
    },
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
      placeholder: "Create a password",
      required: true,
      validate: passwordValidator,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirm Password",
      placeholder: "Confirm your password",
      required: true,
      validate: (value, allValues) => {
        if (value !== allValues?.password) {
          return "Passwords do not match";
        }
        return undefined;
      },
    },
  ],
  submitText: "Create Account",
  loadingText: "Creating account...",
  endpoint: "auth/signUp",
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
}; 