import { FormConfig } from "../FormBuilder";
import { nameValidator, phoneValidator, maxLengthValidator } from "../validators";

export const profileSetupFormConfig: FormConfig = {
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
      name: "phone",
      type: "text",
      label: "Phone Number",
      placeholder: "Enter your phone number (optional)",
      required: false,
      validate: (value) => {
        if (value && value.trim()) {
          return phoneValidator(value);
        }
        return undefined;
      },
    },
    {
      name: "address",
      type: "textarea",
      label: "Address",
      placeholder: "Enter your address (optional)",
      required: false,
      rows: 3,
      validate: (value) => {
        if (value && value.trim()) {
          return maxLengthValidator(200)(value);
        }
        return undefined;
      },
    },
    {
      name: "bio",
      type: "textarea",
      label: "Bio",
      placeholder: "Tell us about yourself (optional)",
      required: false,
      rows: 4,
      validate: (value) => {
        if (value && value.trim()) {
          return maxLengthValidator(500)(value);
        }
        return undefined;
      },
    },
  ],
  submitText: "Complete Setup",
  loadingText: "Saving profile...",
  endpoint: "/api/profiles",
  method: "POST",
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
}; 