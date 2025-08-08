"use client";

import { useFormContext } from "react-hook-form";

import { type ProfileCreationData } from "@/auth/login/validation";
import { Input } from "@/primitives/input";
import { Text } from "@/primitives/text";
import { Textarea } from "@/primitives/textarea";

interface ProfileSetupFormFieldsProps {
  isLoading: boolean;
}

export function ProfileSetupFormFields({
  isLoading,
}: ProfileSetupFormFieldsProps) {
  const form = useFormContext<ProfileCreationData>();

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
          htmlFor="phone"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Phone Number (Optional)
        </label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          {...form.register("phone")}
          disabled={isLoading}
        />
        {form.formState.errors.phone && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.phone.message}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Address (Optional)
        </label>
        <Input
          id="address"
          placeholder="Enter your address"
          {...form.register("address")}
          disabled={isLoading}
        />
        {form.formState.errors.address && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.address.message}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Bio (Optional)
        </label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          {...form.register("bio")}
          disabled={isLoading}
          rows={3}
        />
        {form.formState.errors.bio && (
          <Text className="text-sm text-red-600">
            {form.formState.errors.bio.message}
          </Text>
        )}
      </div>
    </>
  );
}
