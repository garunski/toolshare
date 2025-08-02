"use client";

import { useFormContext } from "react-hook-form";

import { type RegisterFormData } from "@/common/validators/authenticationFormValidator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormFieldsProps {
  isLoading: boolean;
}

export function RegisterFormFields({ isLoading }: RegisterFormFieldsProps) {
  const form = useFormContext<RegisterFormData>();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            {...form.register("firstName")}
            disabled={isLoading}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-600">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            {...form.register("lastName")}
            disabled={isLoading}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-600">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...form.register("email")}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...form.register("password")}
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...form.register("confirmPassword")}
          disabled={isLoading}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
    </>
  );
}
