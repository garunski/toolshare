"use client";

import { useRouter } from "next/navigation";

import { AddToolForm } from "./AddToolForm";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  children?: Category[];
}

interface AddToolFormWrapperProps {
  categories: Category[];
  categoryOptions: Array<{ value: string; label: string }>;
}

export function AddToolFormWrapper({
  categories,
  categoryOptions,
}: AddToolFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/tools");
  };

  return (
    <AddToolForm
      categories={categories}
      categoryOptions={categoryOptions}
      onSuccess={handleSuccess}
    />
  );
}
