"use client";

import { useFormContext } from "react-hook-form";

import { ValidationMessage } from "@/common/forms/ValidationMessage";
import { Input } from "@/primitives/input";

export function ItemNameField() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const nameValue = watch("name");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Item Name *
      </label>
      <Input
        {...register("name", {
          required: "Item name is required",
          minLength: {
            value: 3,
            message: "Item name must be at least 3 characters",
          },
          maxLength: {
            value: 100,
            message: "Item name must be no more than 100 characters",
          },
        })}
        placeholder="Enter a descriptive name for your item"
        maxLength={100}
      />
      {errors.name && (
        <ValidationMessage
          type="error"
          message={errors.name.message as string}
          className="mt-2"
        />
      )}
      {nameValue && (
        <p className="mt-1 text-right text-xs text-gray-500">
          {nameValue.length} / 100 characters
        </p>
      )}
    </div>
  );
}
