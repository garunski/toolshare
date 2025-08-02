"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ProfileCreationData } from "@/common/validators/authenticationFormValidator";

interface ProfileSetupFormFieldsProps {
  isLoading: boolean;
}

export function ProfileSetupFormFields({ isLoading }: ProfileSetupFormFieldsProps) {
  const form = useFormContext<ProfileCreationData>();

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
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          {...form.register("phone")}
          disabled={isLoading}
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-red-600">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Input
          id="address"
          placeholder="Enter your address"
          {...form.register("address")}
          disabled={isLoading}
        />
        {form.formState.errors.address && (
          <p className="text-sm text-red-600">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          {...form.register("bio")}
          disabled={isLoading}
          rows={3}
        />
        {form.formState.errors.bio && (
          <p className="text-sm text-red-600">
            {form.formState.errors.bio.message}
          </p>
        )}
      </div>
    </>
  );
} 