"use client";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export default function AttributesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <Heading level={2} className="mb-2 text-xl font-semibold text-gray-900">
          Attributes Management Error
        </Heading>

        <Text className="mb-4 text-gray-600">
          There was a problem loading the attributes management page. Please try
          again.
        </Text>

        <div className="space-y-3">
          <Button onClick={reset} color="blue" className="w-full">
            Try again
          </Button>

          <a
            href="/admin"
            className="block w-full rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            Go to Admin Panel
          </a>

          <a
            href="/dashboard"
            className="block w-full rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Go to Dashboard
          </a>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error details (dev only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-red-50 p-2 text-xs text-red-600">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
