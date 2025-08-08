import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

// Removed direct operation import - now using API routes
import {
  attributeCreationSchema,
  AttributeValidator,
} from "@/common/validators/attributeValidator";
import type { AttributeDefinition } from "@/types/categories";

type FormData = z.infer<typeof attributeCreationSchema>;

export function useAttributeForm(attribute?: AttributeDefinition | null) {
  const [submitting, setSubmitting] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(attributeCreationSchema),
    defaultValues: {
      name: attribute?.name || "",
      display_label: attribute?.display_label || "",
      description: attribute?.description || "",
      data_type: (attribute?.data_type as any) || "text",
      is_required: attribute?.is_required || false,
      validation_rules: (attribute?.validation_rules as any) || {},
      default_value: attribute?.default_value || "",
      options: (attribute?.options as any)?.options || [],
      display_order: attribute?.display_order || 0,
      is_searchable: attribute?.is_searchable || false,
      is_filterable: attribute?.is_filterable || false,
      help_text: attribute?.help_text || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const watchedDisplayLabel = watch("display_label");
  const watchedDataType = watch("data_type");

  useEffect(() => {
    if (!attribute && watchedDisplayLabel) {
      const generatedName =
        AttributeValidator.generateName(watchedDisplayLabel);
      setValue("name", generatedName);
    }
  }, [watchedDisplayLabel, setValue, attribute]);

  useEffect(() => {
    if (watchedDisplayLabel && watchedDisplayLabel.length > 1) {
      const checkName = async () => {
        const available = await AttributeValidator.isNameAvailable(
          watchedDisplayLabel,
          attribute?.id,
        );
        setNameAvailable(available);
      };
      checkName();
    }
  }, [watchedDisplayLabel, attribute?.id]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const url = attribute
        ? `/api/admin/taxonomy/attributes?id=${attribute.id}`
        : "/api/admin/taxonomy/attributes";

      const method = attribute ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${attribute ? "update" : "create"} attribute`,
        );
      }

      return true;
    } catch (error) {
      alert(
        `Failed to ${attribute ? "update" : "create"} attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    append({ value: "", label: "" });
  };

  const requiresOptions =
    watchedDataType === "select" || watchedDataType === "multi_select";

  return {
    register,
    handleSubmit,
    errors,
    submitting,
    nameAvailable,
    onSubmit,
    fields,
    addOption,
    remove,
    requiresOptions,
  };
}
