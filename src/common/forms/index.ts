// Core components
export { FormBuilder } from "./FormBuilder";
export { FormField } from "./FormField";
export { MultiStepFormBuilder } from "./MultiStepFormBuilder";

// Utilities
export { processFormError } from "./FormErrorProcessor";
export {
  hasValidationErrors,
  validateAllFields,
  validateField,
} from "./FormValidation";

// Validators
export * from "./validators";

// Configurations
export { addToolFormConfig } from "./configs/addToolFormConfig";
export { addToolFormSteps } from "./configs/addToolFormSteps";
export { friendRequestFormConfig } from "./configs/friendRequestFormConfig";
export { loanRequestFormConfig } from "./configs/loanRequestFormConfig";
export { loginFormConfig } from "./configs/loginFormConfig";
export { profileSetupFormConfig } from "./configs/profileSetupFormConfig";
export { registerFormConfig } from "./configs/registerFormConfig";

// Types
export type { FormConfig } from "./FormBuilder";
