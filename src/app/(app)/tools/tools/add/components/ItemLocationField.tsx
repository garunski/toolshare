"use client";

import { useFormContext } from "react-hook-form";

import { ValidationMessage } from "@/common/forms/ValidationMessage";
import { Input } from "@/primitives/input";

export function ItemLocationField() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Location
      </label>
      <Input
        {...register("location", {
          maxLength: {
            value: 100,
            message: "Location must be no more than 100 characters",
          },
        })}
        placeholder="City, State or general area"
        maxLength={100}
      />
      {errors.location && (
        <ValidationMessage
          type="error"
          message={errors.location.message as string}
          className="mt-2"
        />
      )}
    </div>
  );
}
