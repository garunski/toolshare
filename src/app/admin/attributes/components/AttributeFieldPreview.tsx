"use client";

import { Badge } from "@/primitives/badge";
import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";
import { Switch } from "@/primitives/switch";
import type { AttributeDefinition } from "@/types/categories";

interface Props {
  attribute: AttributeDefinition;
}

export function AttributeFieldPreview({ attribute }: Props) {
  const commonProps = {
    placeholder:
      attribute.help_text || `Enter ${attribute.display_label.toLowerCase()}`,
    disabled: true,
  };

  switch (attribute.data_type) {
    case "text":
    case "email":
    case "url":
      return <Input {...commonProps} />;

    case "number":
      return <Input type="number" {...commonProps} />;

    case "date":
      return <Input type="date" {...commonProps} />;

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch disabled />
          <span className="text-sm text-gray-600">True/False toggle</span>
        </div>
      );

    case "select":
      return (
        <Select disabled>
          <option value="">Select an option</option>
          {(attribute.options as any)?.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );

    case "multi_select":
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Multiple selection dropdown</p>
          <div className="flex flex-wrap gap-2">
            {(attribute.options as any)?.options
              ?.slice(0, 3)
              .map((option: any) => (
                <Badge key={option.value} color="zinc">
                  {option.label}
                </Badge>
              ))}
            {((attribute.options as any)?.options?.length || 0) > 3 && (
              <Badge color="zinc">
                +{((attribute.options as any)?.options?.length || 0) - 3} more
              </Badge>
            )}
          </div>
        </div>
      );

    default:
      return <Input {...commonProps} />;
  }
}
