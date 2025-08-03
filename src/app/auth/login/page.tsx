"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormBuilder } from "@/components/forms";
import { loginFormConfig } from "@/components/forms/configs/loginFormConfig";
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
          
          <FormBuilder
            config={{
              ...loginFormConfig,
              onSuccess: () => router.push("/dashboard"),
            }}
          />

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
