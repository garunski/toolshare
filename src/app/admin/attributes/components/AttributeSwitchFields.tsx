"use client";

import type { UseFormRegister } from "react-hook-form";

import { Switch } from "@/primitives/switch";

// Custom Switch wrapper for React Hook Form
function FormSwitch({
  register,
  name,
  ...props
}: {
  register: UseFormRegister<any>;
  name: string;
  [key: string]: any;
}) {
  const { onChange, ...rest } = register(name);

  return (
    <Switch
      {...rest}
      onChange={(checked: boolean) => {
        onChange({ target: { name, value: checked, type: "checkbox" } });
      }}
      {...props}
    />
  );
}

interface AttributeSwitchFieldsProps {
  register: UseFormRegister<any>;
}

export function AttributeSwitchFields({
  register,
}: AttributeSwitchFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Required Field</span>
          <p className="text-xs text-gray-500">Users must provide a value</p>
        </div>
        <FormSwitch register={register} name="is_required" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Searchable</span>
          <p className="text-xs text-gray-500">Include in search results</p>
        </div>
        <FormSwitch register={register} name="is_searchable" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Filterable</span>
          <p className="text-xs text-gray-500">Show in filter options</p>
        </div>
        <FormSwitch register={register} name="is_filterable" />
      </div>
    </div>
  );
}
