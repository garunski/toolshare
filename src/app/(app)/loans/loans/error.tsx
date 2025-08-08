"use client";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export default function LoansError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="text-center">
        <Heading level={1} className="mb-4 text-2xl font-bold text-red-600">
          Something went wrong!
        </Heading>
        <Text className="mb-6 text-gray-600 dark:text-gray-400">
          {error.message || "Failed to load your loans. Please try again."}
        </Text>
        <Button onClick={reset} color="blue">
          Try again
        </Button>
      </div>
    </div>
  );
}
