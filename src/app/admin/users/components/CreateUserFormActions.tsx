"use client";

import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";

interface CreateUserFormActionsProps {
  loading: boolean;
  error: string | null;
  success: string | null;
  onCancel: () => void;
}

export function CreateUserFormActions({
  loading,
  error,
  success,
  onCancel,
}: CreateUserFormActionsProps) {
  return (
    <>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-800">{error}</Text>
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <Text className="text-sm text-green-800">{success}</Text>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" outline onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </>
  );
}
