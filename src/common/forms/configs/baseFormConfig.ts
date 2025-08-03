import { FormConfig } from "../FormBuilder";
import {
  emailValidator,
  maxLengthValidator,
  minLengthValidator,
  nameValidator,
  passwordValidator,
  phoneValidator,
  requiredValidator,
} from "../validators";

export interface BaseFormConfigOptions {
  submitText?: string;
  loadingText?: string;
  endpoint?: string;
  method?: "POST" | "PUT" | "PATCH";
  containerClassName?: string;
}

export const createBaseFormConfig = (
  options: BaseFormConfigOptions = {},
): Partial<FormConfig> => ({
  submitText: options.submitText || "Submit",
  loadingText: options.loadingText || "Processing...",
  endpoint: options.endpoint,
  method: (options.method as "POST" | "PUT" | "PATCH") || "POST",
  containerClassName:
    options.containerClassName ||
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
});

// Common field definitions
export const nameFields = [
  {
    name: "firstName",
    type: "text" as const,
    label: "First Name",
    placeholder: "Enter your first name",
    required: true,
    validate: nameValidator,
  },
  {
    name: "lastName",
    type: "text" as const,
    label: "Last Name",
    placeholder: "Enter your last name",
    required: true,
    validate: nameValidator,
  },
];

export const toolNameField = {
  name: "name",
  type: "text" as const,
  label: "Tool Name",
  placeholder: "Enter tool name",
  required: true,
  validate: (value: string) => {
    const required = requiredValidator(value);
    if (required) return required;
    const minLength = minLengthValidator(2)(value);
    if (minLength) return minLength;
    const maxLength = maxLengthValidator(100)(value);
    if (maxLength) return maxLength;
    return undefined;
  },
};

export const toolDescriptionField = {
  name: "description",
  type: "textarea" as const,
  label: "Description",
  placeholder: "Describe your tool",
  required: true,
  rows: 4,
  validate: (value: string) => {
    const required = requiredValidator(value);
    if (required) return required;
    const minLength = minLengthValidator(10)(value);
    if (minLength) return minLength;
    const maxLength = maxLengthValidator(500)(value);
    if (maxLength) return maxLength;
    return undefined;
  },
};

export const toolCategoryField = {
  name: "category",
  type: "select" as const,
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
};

export const toolConditionField = {
  name: "condition",
  type: "select" as const,
  label: "Condition",
  placeholder: "Select condition",
  required: true,
  options: [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ],
};

export const toolImagesField = {
  name: "images",
  type: "file" as const,
  label: "Images",
  placeholder: "Upload tool images",
  accept: "image/*",
  multiple: true,
  validate: (value: any) => {
    // File validation logic
    return undefined;
  },
};

export const optionalTextareaField = (
  name: string,
  label: string,
  placeholder: string,
  maxLength: number,
  rows: number = 3,
) => ({
  name,
  type: "textarea" as const,
  label,
  placeholder,
  required: false,
  rows,
  validate: (value: string) => {
    if (value && value.trim()) {
      return maxLengthValidator(maxLength)(value);
    }
    return undefined;
  },
});

export const optionalPhoneField = {
  name: "phone",
  type: "text" as const,
  label: "Phone Number",
  placeholder: "Enter your phone number (optional)",
  required: false,
  validate: (value: string) => {
    if (value && value.trim()) {
      return phoneValidator(value);
    }
    return undefined;
  },
};

export const emailField = {
  name: "email",
  type: "email" as const,
  label: "Email",
  placeholder: "Enter your email address",
  required: true,
  validate: emailValidator,
};

export const passwordField = {
  name: "password",
  type: "password" as const,
  label: "Password",
  placeholder: "Create a password",
  required: true,
  validate: passwordValidator,
};

export const confirmPasswordField = {
  name: "confirmPassword",
  type: "password" as const,
  label: "Confirm Password",
  placeholder: "Confirm your password",
  required: true,
  validate: (value: string, allValues?: any) => {
    if (value !== allValues?.password) {
      return "Passwords do not match";
    }
    return undefined;
  },
};
