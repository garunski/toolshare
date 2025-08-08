"use client";

import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";

export default function AdminUsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="space-y-4">
        <Text className="text-lg font-semibold text-red-800">
          Error Loading Users
        </Text>
        <Text className="text-red-700">
          {error.message || "An unexpected error occurred while loading users."}
        </Text>
        <Button onClick={reset} outline>
          Try Again
        </Button>
      </div>
    </div>
  );
}
