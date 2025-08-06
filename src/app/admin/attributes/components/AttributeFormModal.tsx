"use client";

import { Button } from "@/primitives/button";
import { Dialog } from "@/primitives/dialog";
import type { AttributeDefinition } from "@/types/categories";

import { useAttributeForm } from "../hooks/useAttributeForm";

import { AttributeFormFields } from "./AttributeFormFields";

interface Props {
  attribute?: AttributeDefinition | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AttributeFormModal({ attribute, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    errors,
    submitting,
    nameAvailable,
    onSubmit,
  } = useAttributeForm(attribute);

  const handleFormSubmit = async (data: any) => {
    const success = await onSubmit(data);
    if (success) {
      onSuccess();
    }
  };

  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="max-h-[90vh] overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold">
          {attribute ? "Edit Attribute" : "Create Attribute"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <AttributeFormFields
            register={register}
            errors={errors}
            nameAvailable={nameAvailable}
          />

          <div className="flex justify-end space-x-3 border-t pt-6">
            <Button outline onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={submitting || nameAvailable === false}>
              {submitting ? "Saving..." : attribute ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
