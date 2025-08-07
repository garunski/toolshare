"use client";

import { useFormContext } from "react-hook-form";

import { type RegisterFormData } from "@/common/validators/authenticationFormValidator";
import { Input } from "@/primitives/input";
import { Text } from "@/primitives/text";

interface RegisterFormFieldsProps {
  isLoading: boolean;
}

export function RegisterFormFields({ isLoading }: RegisterFormFieldsProps) {
  const form = useFormContext<RegisterFormData>();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-zinc-900 dark:text-white"
          >
            First Name
          </label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            {...form.register("firstName")}
            disabled={isLoading}
          />
          {form.formState.errors.firstName && (
            <Text className="text-sm text-red-600">
              {form.formState.errors.firstName.message}
            </Text>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-zinc-900 dark:text-white"
          >
            Last Name
          </label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            {...form.register("lastName")}
            disabled={isLoading}
          />
          {form.formState.errors.lastName && (
            <Text className="text-sm text-red-600">
              {form.formState.errors.lastName.message}
            </Text>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...form.register("email")}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...form.register("password")}
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.password.message}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...form.register("confirmPassword")}
          disabled={isLoading}
        />
        {form.formState.errors.confirmPassword && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.confirmPassword.message}
          </Text>
        )}
      </div>
    </>
  );
}
