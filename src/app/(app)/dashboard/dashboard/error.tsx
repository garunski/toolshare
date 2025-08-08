"use client";

import Link from "next/link";

import { Button } from "@/primitives/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Dashboard Error
        </h2>
        <p className="mb-6 text-gray-600">{error.message}</p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try again
          </button>
          <Link href="/auth/login">
            <Button outline>Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
