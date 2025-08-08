"use client";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export default function BrowseToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <Heading level={1} className="mb-4 text-2xl font-bold text-red-600">
              Search Error
            </Heading>
            <Text className="mb-6 text-gray-600 dark:text-gray-400">
              {error.message ||
                "Failed to load search results. Please try again."}
            </Text>
            <Button onClick={reset} color="blue">
              Try again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
