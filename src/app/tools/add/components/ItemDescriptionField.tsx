"use client";

import { useFormContext } from "react-hook-form";

import { ValidationMessage } from "@/common/forms/ValidationMessage";
import { Textarea } from "@/primitives/textarea";

export function ItemDescriptionField() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const descriptionValue = watch("description");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Description *
      </label>
      <Textarea
        {...register("description", {
          required: "Description is required",
          minLength: {
            value: 10,
            message: "Description must be at least 10 characters",
          },
          maxLength: {
            value: 500,
            message: "Description must be no more than 500 characters",
          },
        })}
        placeholder="Describe your item in detail. Include its condition, features, and any relevant information."
        rows={4}
        maxLength={500}
      />
      {errors.description && (
        <ValidationMessage
          type="error"
          message={errors.description.message as string}
          className="mt-2"
        />
      )}
      {descriptionValue && (
        <p className="mt-1 text-right text-xs text-gray-500">
          {descriptionValue.length} / 500 characters
        </p>
      )}
    </div>
  );
}
