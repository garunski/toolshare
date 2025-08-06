"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";
import { Textarea } from "@/primitives/textarea";

import { AttributeSwitchFields } from "./AttributeSwitchFields";

interface AttributeFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  nameAvailable: boolean | null;
}

export function AttributeFormFields({
  register,
  errors,
  nameAvailable,
}: AttributeFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Display Label *
          </label>
          <Input {...register("display_label")} placeholder="Brand Name" />
          {errors.display_label?.message && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.display_label.message)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Internal Name *
          </label>
          <Input {...register("name")} placeholder="brand_name" />
          {errors.name?.message && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.name.message)}
            </p>
          )}
          {nameAvailable === false && (
            <p className="mt-1 text-sm text-red-600">Name is already taken</p>
          )}
          {nameAvailable === true && (
            <p className="mt-1 text-sm text-green-600">Name is available</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <Textarea
          {...register("description")}
          placeholder="Attribute description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Data Type *</label>
          <Select {...register("data_type")}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="date">Date</option>
            <option value="select">Select (Single Choice)</option>
            <option value="multi_select">Multi Select</option>
            <option value="url">URL</option>
            <option value="email">Email</option>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Display Order
          </label>
          <Input
            type="number"
            {...register("display_order", { valueAsNumber: true })}
            placeholder="0"
            min="0"
            max="9999"
          />
        </div>
      </div>

      <AttributeSwitchFields register={register} />
    </>
  );
}
