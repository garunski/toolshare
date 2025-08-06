"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/primitives/input";

export function ItemTagsField() {
  const { register } = useFormContext();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Tags
      </label>
      <Input
        {...register("tags")}
        placeholder="Enter tags separated by commas (e.g., power tools, DIY, construction)"
        maxLength={200}
      />
      <p className="mt-1 text-xs text-gray-500">
        Tags help others find your item. Separate multiple tags with commas.
      </p>
    </div>
  );
}
