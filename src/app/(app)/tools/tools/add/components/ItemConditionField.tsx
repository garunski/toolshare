"use client";

import { useFormContext } from "react-hook-form";

export function ItemConditionField() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Condition *
      </label>
      <select
        {...register("condition", {
          required: "Please select the item condition",
        })}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Select condition</option>
        <option value="new">New</option>
        <option value="like_new">Like New</option>
        <option value="excellent">Excellent</option>
        <option value="good">Good</option>
        <option value="fair">Fair</option>
        <option value="poor">Poor</option>
      </select>
      {errors.condition && (
        <div className="mt-2 text-sm text-red-600">
          {errors.condition.message as string}
        </div>
      )}
    </div>
  );
}
