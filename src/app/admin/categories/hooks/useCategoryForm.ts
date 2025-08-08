import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

// Removed direct operation import - now using API routes
import {
  categoryCreationSchema,
  generateSlug,
  isSlugAvailable,
} from "@/admin/categories/validation";
import type { Category } from "@/types/categories";

type FormData = z.infer<typeof categoryCreationSchema>;

export function useCategoryForm(category?: Category | null) {
  const [submitting, setSubmitting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(categoryCreationSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parent_id: category?.parent_id || undefined,
      icon: category?.icon || "folder",
      color: category?.color || "#6b7280",
      sort_order: category?.sort_order || 0,
    },
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");

  useEffect(() => {
    if (!category && watchedName) {
      const generatedSlug = generateSlug(watchedName);
      setValue("slug", generatedSlug);
    }
  }, [watchedName, setValue, category]);

  useEffect(() => {
    if (watchedSlug && watchedSlug.length > 1) {
      const checkSlug = async () => {
        const available = await isSlugAvailable(watchedSlug, category?.id);
        setSlugAvailable(available);
      };
      checkSlug();
    }
  }, [watchedSlug, category?.id]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const url = category
        ? `/api/admin/taxonomy/categories/crud?id=${category.id}`
        : "/api/admin/taxonomy/categories/crud";

      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${category ? "update" : "create"} category`);
      }

      return true;
    } catch (error) {
      alert(
        `Failed to ${category ? "update" : "create"} category: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    submitting,
    slugAvailable,
    onSubmit,
  };
}
