# Form Builder Migration Plan

## Overview

This document outlines the comprehensive plan to migrate all existing forms in the ToolShare project to use a centralized FormBuilder pattern, inspired by the implementation in the validnames project. This migration will significantly reduce code duplication, improve maintainability, and provide consistent form behavior across the application.

## Current State Analysis

### Existing Form Patterns
The current codebase uses several different form patterns:
1. **React Hook Form + Zod** (most common)
2. **Custom form state management**
3. **Multi-step forms with custom logic**
4. **Mixed validation approaches**

### Problems with Current Approach
- **Code Duplication**: Similar form logic repeated across components
- **Inconsistent Validation**: Different validation patterns in different forms
- **Complex State Management**: Each form manages its own loading, error, and validation states
- **Maintenance Overhead**: Changes to form behavior require updates in multiple places
- **Inconsistent UX**: Different forms behave differently

## FormBuilder Architecture

### Core Components

#### 1. FormBuilder.tsx
The main form orchestrator that handles:
- Form state management
- Validation
- API calls
- Error handling
- Loading states
- CSRF token management

#### 2. FormField.tsx
Individual field component that supports:
- Text inputs
- Email inputs
- Password inputs
- Number inputs
- Textarea inputs
- Turnstile (captcha) fields
- Custom validation
- Error display

#### 3. FormValidation.ts
Centralized validation utilities:
- Field-level validation
- Form-level validation
- Error aggregation

#### 4. FormErrorProcessor.ts
Standardized error handling:
- API error processing
- Field-specific error mapping
- General error handling

## Migration Strategy

### Phase 1: Core Infrastructure Setup

#### 1.1 Create FormBuilder Components
```typescript
// src/components/forms/FormBuilder.tsx
export interface FormConfig {
  fields: FormFieldType[];
  submitText: string;
  loadingText: string;
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  invalidateQueries?: string[];
  containerClassName?: string;
  layout?: "horizontal" | "vertical";
  onSuccess?: (data?: unknown, formValues?: Record<string, string>) => void;
  onCancel?: () => void;
  additionalData?: Record<string, unknown>;
  initialValues?: Record<string, string>;
  onGeneralError?: (error: string | null) => void;
}
```

#### 1.2 Create FormField Component
```typescript
// src/components/forms/FormField.tsx
export interface FormField {
  name: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "file" | "checkbox";
  placeholder: string;
  label?: string;
  required?: boolean;
  className?: string;
  rows?: number;
  options?: Array<{ value: string; label: string }>; // For select fields
  validate?: (value: string, allValues?: Record<string, string>) => string | undefined;
  accept?: string; // For file inputs
  multiple?: boolean; // For file inputs
}
```

#### 1.3 Create Validation Utilities
```typescript
// src/components/forms/FormValidation.ts
export function validateField(
  field: FormField,
  value: string,
  allValues?: Record<string, string>,
): string | undefined {
  if (field.validate) {
    return field.validate(value, allValues);
  }
  return undefined;
}

export function validateAllFields(
  fields: FormField[],
  formData: Record<string, string>,
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  fields.forEach((field) => {
    const value = formData[field.name] || "";
    const error = validateField(field, value, formData);
    if (error) {
      errors[field.name] = error;
    }
  });
  return errors;
}
```

#### 1.4 Create Error Processor
```typescript
// src/components/forms/FormErrorProcessor.ts
export function processFormError(error: unknown) {
  let handled = false;
  const fieldErrors: Record<string, string> = {};
  let generalError: string | null = null;

  if (typeof error === "object" && error !== null) {
    const errObj = error as {
      error?: string;
      details?: {
        errors?: Array<{ field?: string; message?: string }>;
      };
    };

    if (errObj.details && Array.isArray(errObj.details.errors)) {
      errObj.details.errors.forEach((err) => {
        if (err.field) {
          fieldErrors[err.field] = err.message || "Invalid value";
        }
      });
      if (Object.keys(fieldErrors).length > 0) {
        handled = true;
      }
    }

    if (!handled && errObj.error) {
      generalError = errObj.error;
      handled = true;
    }
  }

  if (!handled) {
    if (error instanceof Error) {
      generalError = error.message;
    } else {
      generalError = "Operation failed";
    }
  }

  return { fieldErrors, generalError };
}
```

### Phase 2: Form Configurations

#### 2.1 Authentication Forms

##### Register Form Configuration
```typescript
// src/components/forms/configs/registerFormConfig.ts
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
  endpoint: "/api/auth/register",
  method: "POST",
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
```

##### Login Form Configuration
```typescript
// src/components/forms/configs/loginFormConfig.ts
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
  endpoint: "/api/auth/login",
  method: "POST",
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
```

#### 2.2 Tool Forms

##### Add Tool Form Configuration
```typescript
// src/components/forms/configs/addToolFormConfig.ts
export const addToolFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      type: "text",
      label: "Tool Name",
      placeholder: "Enter tool name",
      required: true,
      validate: (value) => {
        if (!value.trim()) return "Tool name is required";
        if (value.length < 2) return "Tool name must be at least 2 characters";
        if (value.length > 100) return "Tool name must be less than 100 characters";
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
        if (!value.trim()) return "Description is required";
        if (value.length < 10) return "Description must be at least 10 characters";
        if (value.length > 500) return "Description must be less than 500 characters";
        return undefined;
      },
    },
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
      name: "images",
      type: "file",
      label: "Images",
      placeholder: "Upload tool images",
      accept: "image/*",
      multiple: true,
      validate: (value) => {
        // File validation logic
        return undefined;
      },
    },
  ],
  submitText: "Create Tool",
  loadingText: "Creating...",
  endpoint: "/api/tools",
  method: "POST",
  invalidateQueries: ["tools", "user-tools"],
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
```

#### 2.3 Social Forms

##### Friend Request Form Configuration
```typescript
// src/components/forms/configs/friendRequestFormConfig.ts
export const friendRequestFormConfig: FormConfig = {
  fields: [
    {
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "Add a personal message (optional)",
      rows: 3,
      validate: (value) => {
        if (value && value.length > 200) {
          return "Message must be less than 200 characters";
        }
        return undefined;
      },
    },
  ],
  submitText: "Send Friend Request",
  loadingText: "Sending...",
  endpoint: "/api/social/friend-requests",
  method: "POST",
  invalidateQueries: ["friend-requests", "suggested-friends"],
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
```

#### 2.4 Loan Forms

##### Loan Request Form Configuration
```typescript
// src/components/forms/configs/loanRequestFormConfig.ts
export const loanRequestFormConfig: FormConfig = {
  fields: [
    {
      name: "startDate",
      type: "date",
      label: "Start Date",
      placeholder: "Select start date",
      required: true,
      validate: (value) => {
        const date = new Date(value);
        const today = new Date();
        if (date < today) {
          return "Start date cannot be in the past";
        }
        return undefined;
      },
    },
    {
      name: "endDate",
      type: "date",
      label: "End Date",
      placeholder: "Select end date",
      required: true,
      validate: (value, allValues) => {
        const endDate = new Date(value);
        const startDate = new Date(allValues?.startDate || "");
        if (endDate <= startDate) {
          return "End date must be after start date";
        }
        return undefined;
      },
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "Add a message to the tool owner",
      rows: 3,
      validate: (value) => {
        if (value && value.length > 300) {
          return "Message must be less than 300 characters";
        }
        return undefined;
      },
    },
  ],
  submitText: "Request Tool",
  loadingText: "Sending request...",
  endpoint: "/api/loans",
  method: "POST",
  invalidateQueries: ["loans", "available-tools"],
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
```

### Phase 3: Migration Implementation

#### 3.1 Create Form Validators
```typescript
// src/components/forms/validators/index.ts
export const emailValidator = (value: string): string | undefined => {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Please enter a valid email address";
  return undefined;
};

export const passwordValidator = (value: string): string | undefined => {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
  if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
  if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
  return undefined;
};

export const nameValidator = (value: string): string | undefined => {
  if (!value) return "Name is required";
  if (value.length < 2) return "Name must be at least 2 characters";
  if (value.length > 50) return "Name must be less than 50 characters";
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return undefined;
};

export const requiredValidator = (value: string): string | undefined => {
  if (!value || !value.trim()) return "This field is required";
  return undefined;
};

export const minLengthValidator = (min: number) => (value: string): string | undefined => {
  if (value && value.length < min) return `Must be at least ${min} characters`;
  return undefined;
};

export const maxLengthValidator = (max: number) => (value: string): string | undefined => {
  if (value && value.length > max) return `Must be less than ${max} characters`;
  return undefined;
};
```

#### 3.2 Create Form Hooks
```typescript
// src/components/forms/hooks/useFormBuilder.ts
import { useState, useCallback } from "react";
import { FormConfig } from "../FormBuilder";

export function useFormBuilder(config: FormConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = useCallback((data?: unknown, formValues?: Record<string, string>) => {
    setError(null);
    config.onSuccess?.(data, formValues);
  }, [config]);

  const handleError = useCallback((error: string | null) => {
    setError(error);
    config.onGeneralError?.(error);
  }, [config]);

  const handleCancel = useCallback(() => {
    setError(null);
    config.onCancel?.();
  }, [config]);

  return {
    isLoading,
    error,
    handleSuccess,
    handleError,
    handleCancel,
  };
}
```

#### 3.3 Create Specialized Form Components

##### Multi-Step Form Builder
```typescript
// src/components/forms/MultiStepFormBuilder.tsx
import { useState } from "react";
import { FormBuilder, type FormConfig } from "./FormBuilder";

interface Step {
  key: string;
  title: string;
  description: string;
  config: FormConfig;
}

interface MultiStepFormBuilderProps {
  steps: Step[];
  onComplete: (allData: Record<string, string>) => void;
  onCancel?: () => void;
}

export function MultiStepFormBuilder({ steps, onComplete, onCancel }: MultiStepFormBuilderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleStepSuccess = (data: unknown, stepData: Record<string, string>) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    if (isLastStep) {
      onComplete(newFormData);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  index <= currentStepIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-px w-8 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Form */}
      <FormBuilder
        config={{
          ...currentStep.config,
          onSuccess: handleStepSuccess,
          onCancel,
          initialValues: formData,
        }}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
      </div>
    </div>
  );
}
```

### Phase 4: Form Migration

#### 4.1 Authentication Forms Migration

##### Before (RegisterForm.tsx)
```typescript
// Current implementation with React Hook Form
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-6">
        <Heading level={2} className="text-xl font-semibold">
          Sign Up
        </Heading>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create your account to start sharing tools with your community
        </Text>
      </div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RegisterFormFields isLoading={isLoading} />

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
```

##### After (RegisterForm.tsx)
```typescript
// New implementation with FormBuilder
import { FormBuilder } from "@/components/forms/FormBuilder";
import { registerFormConfig } from "@/components/forms/configs/registerFormConfig";

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-6">
        <Heading level={2} className="text-xl font-semibold">
          Sign Up
        </Heading>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create your account to start sharing tools with your community
        </Text>
      </div>
      
      <FormBuilder
        config={{
          ...registerFormConfig,
          onSuccess: () => onSuccess(),
        }}
      />

      <div className="mt-6 text-center">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
```

#### 4.2 Tool Forms Migration

##### Before (AddToolForm.tsx)
```typescript
// Current implementation with custom state management
export function AddToolForm({ userId, onSuccess }: AddToolFormProps) {
  const {
    form,
    currentStep,
    isLoading,
    error,
    uploadedImages,
    steps,
    currentStepIndex,
    nextStep,
    prevStep,
    handleImageUpload,
    handleSubmit,
  } = useAddToolForm(userId, onSuccess);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        {/* Progress Steps */}
        <div className="mb-8">
          {/* ... complex step rendering logic ... */}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <AddToolFormSteps
          currentStep={currentStep}
          form={form}
          uploadedImages={uploadedImages}
          onImageUpload={handleImageUpload}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            outline
            onClick={prevStep}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStepIndex < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Tool"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

##### After (AddToolForm.tsx)
```typescript
// New implementation with MultiStepFormBuilder
import { MultiStepFormBuilder } from "@/components/forms/MultiStepFormBuilder";
import { addToolFormSteps } from "@/components/forms/configs/addToolFormSteps";

export function AddToolForm({ userId, onSuccess }: AddToolFormProps) {
  const handleComplete = async (allData: Record<string, string>) => {
    try {
      // Handle the complete form data
      await createTool(allData, userId);
      onSuccess();
    } catch (error) {
      console.error("Failed to create tool:", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-6">
          <Heading level={2} className="text-xl font-semibold">
            Add New Tool
          </Heading>
          <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Share your tools with the community
          </Text>
        </div>

        <MultiStepFormBuilder
          steps={addToolFormSteps}
          onComplete={handleComplete}
          onCancel={() => window.history.back()}
        />
      </div>
    </div>
  );
}
```

### Phase 5: API Integration

#### 5.1 Create Form API Handlers
```typescript
// src/app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processFormError } from "@/components/forms/FormErrorProcessor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formType, data } = body;

    // Route to appropriate handler based on form type
    switch (formType) {
      case "register":
        return await handleRegister(data);
      case "login":
        return await handleLogin(data);
      case "add-tool":
        return await handleAddTool(data);
      case "friend-request":
        return await handleFriendRequest(data);
      case "loan-request":
        return await handleLoanRequest(data);
      default:
        return NextResponse.json(
          { error: "Unknown form type" },
          { status: 400 }
        );
    }
  } catch (error) {
    const { fieldErrors, generalError } = processFormError(error);
    
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { details: { errors: Object.entries(fieldErrors).map(([field, message]) => ({ field, message })) } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: generalError || "An error occurred" },
      { status: 500 }
    );
  }
}

async function handleRegister(data: any) {
  // Implementation for register form
}

async function handleLogin(data: any) {
  // Implementation for login form
}

async function handleAddTool(data: any) {
  // Implementation for add tool form
}

async function handleFriendRequest(data: any) {
  // Implementation for friend request form
}

async function handleLoanRequest(data: any) {
  // Implementation for loan request form
}
```

### Phase 6: Testing Strategy

#### 6.1 Unit Tests
```typescript
// src/components/forms/__tests__/FormBuilder.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormBuilder } from "../FormBuilder";

describe("FormBuilder", () => {
  const mockConfig = {
    fields: [
      {
        name: "email",
        type: "email" as const,
        label: "Email",
        placeholder: "Enter email",
        required: true,
      },
    ],
    submitText: "Submit",
    loadingText: "Loading...",
    endpoint: "/api/test",
  };

  it("renders form fields correctly", () => {
    render(<FormBuilder config={mockConfig} onSuccess={() => {}} />);
    
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const onSuccess = jest.fn();
    render(<FormBuilder config={mockConfig} onSuccess={onSuccess} />);
    
    fireEvent.click(screen.getByText("Submit"));
    
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
    
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("submits form successfully", async () => {
    const onSuccess = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;

    render(<FormBuilder config={mockConfig} onSuccess={onSuccess} />);
    
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    
    fireEvent.click(screen.getByText("Submit"));
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

#### 6.2 Integration Tests
```typescript
// src/components/forms/__tests__/FormBuilder.integration.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormBuilder } from "../FormBuilder";
import { registerFormConfig } from "../configs/registerFormConfig";

describe("FormBuilder Integration", () => {
  it("handles complete registration flow", async () => {
    const onSuccess = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;

    render(
      <FormBuilder
        config={{ ...registerFormConfig, onSuccess }}
        onSuccess={onSuccess}
      />
    );

    // Fill out all fields
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### Phase 7: Migration Checklist

#### 7.1 Forms to Migrate
- [ ] RegisterForm
- [ ] LoginForm
- [ ] ProfileSetupForm
- [ ] AddToolForm (multi-step)
- [ ] EditToolForm
- [ ] ToolRequestForm
- [ ] FriendRequestForm
- [ ] MessageForm
- [ ] LoanRequestForm
- [ ] LoanActionForm
- [ ] ReviewForm

#### 7.2 Migration Steps for Each Form
1. **Analyze current form structure**
2. **Create form configuration**
3. **Implement custom validators if needed**
4. **Create API endpoint handler**
5. **Replace form component with FormBuilder**
6. **Update tests**
7. **Remove old form files**

#### 7.3 Benefits After Migration
- **Reduced Code Duplication**: ~70% reduction in form-related code
- **Consistent UX**: All forms behave the same way
- **Easier Maintenance**: Changes to form behavior in one place
- **Better Error Handling**: Standardized error processing
- **Improved Accessibility**: Consistent ARIA attributes and keyboard navigation
- **Type Safety**: Better TypeScript integration
- **Testing**: Easier to test with standardized patterns

### Phase 8: Performance Considerations

#### 8.1 Lazy Loading
```typescript
// src/components/forms/index.ts
export const FormBuilder = lazy(() => import("./FormBuilder"));
export const MultiStepFormBuilder = lazy(() => import("./MultiStepFormBuilder"));
```

#### 8.2 Form Configurations Caching
```typescript
// src/components/forms/configs/index.ts
import { memoize } from "lodash";

export const getFormConfig = memoize((formType: string) => {
  switch (formType) {
    case "register":
      return registerFormConfig;
    case "login":
      return loginFormConfig;
    // ... other cases
  }
});
```

### Phase 9: Documentation

#### 9.1 Usage Examples
```typescript
// Basic form usage
<FormBuilder
  config={loginFormConfig}
  onSuccess={() => router.push("/dashboard")}
/>

// Form with custom handlers
<FormBuilder
  config={registerFormConfig}
  onSuccess={(data) => {
    console.log("Registration successful:", data);
    router.push("/auth/verify-email");
  }}
  onCancel={() => router.back()}
  onGeneralError={(error) => {
    toast.error(error || "An error occurred");
  }}
/>

// Multi-step form
<MultiStepFormBuilder
  steps={addToolFormSteps}
  onComplete={(allData) => {
    console.log("All steps completed:", allData);
    router.push("/tools");
  }}
/>
```

#### 9.2 Custom Field Types
```typescript
// Adding custom field types
interface CustomFormField extends FormField {
  type: "custom-select" | "date-picker" | "file-upload";
  customProps?: Record<string, unknown>;
}

// Extending FormField component
export function FormField({ field, ...props }: FormFieldProps) {
  if (field.type === "custom-select") {
    return <CustomSelect field={field} {...props} />;
  }
  
  if (field.type === "date-picker") {
    return <DatePicker field={field} {...props} />;
  }
  
  // ... existing field types
}
```

## Conclusion

This comprehensive migration plan will transform the ToolShare project's form handling from a collection of inconsistent, duplicated implementations into a unified, maintainable, and user-friendly system. The FormBuilder pattern will provide:

1. **Consistency**: All forms will behave the same way
2. **Maintainability**: Changes to form behavior in one place
3. **Developer Experience**: Faster form development
4. **User Experience**: Consistent and predictable form interactions
5. **Accessibility**: Built-in accessibility features
6. **Testing**: Easier to test with standardized patterns

The migration should be done in phases to minimize disruption and ensure each phase is working correctly before moving to the next. This approach will result in a more robust, maintainable, and user-friendly application. 