"use client";

import { HelpText } from "./HelpText";
import { ItemConditionField } from "./ItemConditionField";
import { ItemDescriptionField } from "./ItemDescriptionField";
import { ItemLocationField } from "./ItemLocationField";
import { ItemNameField } from "./ItemNameField";
import { ItemTagsField } from "./ItemTagsField";

interface Props {
  className?: string;
}

export function BasicItemFields({ className }: Props) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          Basic Information
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Provide the essential details about your item that will help others
          understand what you&apos;re sharing.
        </p>
      </div>

      <div className="space-y-4">
        <ItemNameField />
        <ItemDescriptionField />
        <ItemConditionField />
        <ItemLocationField />
        <ItemTagsField />
      </div>

      <HelpText />
    </div>
  );
}
