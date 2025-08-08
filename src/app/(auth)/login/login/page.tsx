"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Heading level={1} className="text-3xl font-bold text-gray-900">
            ToolShare
          </Heading>
          <Text className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </Text>
        </div>

        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-6">
            <Heading level={2} className="text-xl font-semibold">
              Sign In
            </Heading>
            <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your email and password to access your account
            </Text>
          </div>

          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
