"use client";

import { useCategories } from "@/common/hooks/useCategories";
import { Button } from "@/primitives/button";
import { Dialog } from "@/primitives/dialog";
import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";
import { Textarea } from "@/primitives/textarea";
import type { Category } from "@/types/categories";

import { useCategoryForm } from "../hooks/useCategoryForm";

interface Props {
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryFormModal({ category, onClose, onSuccess }: Props) {
  const { categories } = useCategories();
  const {
    register,
    handleSubmit,
    errors,
    submitting,
    slugAvailable,
    onSubmit,
  } = useCategoryForm(category);

  const handleFormSubmit = async (data: any) => {
    const success = await onSubmit(data);
    if (success) {
      onSuccess();
    }
  };

  const categoryOptions = categories
    .filter((cat) => !category || cat.id !== category.id)
    .map((cat) => ({
      value: cat.id,
      label: cat.path,
    }));

  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">
          {category ? "Edit Category" : "Create Category"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="Category name" />
            {errors.name?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Slug</label>
            <Input {...register("slug")} placeholder="category-slug" />
            {errors.slug?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
            {slugAvailable === false && (
              <p className="mt-1 text-sm text-red-600">Slug is already taken</p>
            )}
            {slugAvailable === true && (
              <p className="mt-1 text-sm text-green-600">Slug is available</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <Textarea
              {...register("description")}
              placeholder="Category description"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Parent Category
            </label>
            <Select {...register("parent_id")}>
              <option value="">None (Root Category)</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button outline onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={submitting || slugAvailable === false}>
              {submitting ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
