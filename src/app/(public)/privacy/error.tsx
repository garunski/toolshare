"use client";

import Link from "next/link";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export default function PrivacyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <Heading level={2} className="mb-2 text-xl font-semibold text-gray-900">
          Oops! Something went wrong
        </Heading>

        <Text className="mb-4 text-gray-600">
          We&apos;re having trouble loading the privacy policy. Please try
          again.
        </Text>

        <div className="space-y-3">
          <Button onClick={reset} color="blue" className="w-full">
            Try again
          </Button>

          <Link
            href="/"
            className="block w-full rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Go to homepage
          </Link>
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
