"use client";

import Link from "next/link";

import { FormBuilder } from "@/common/forms";
import { registerFormConfig } from "@/common/forms/configs/registerFormConfig";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-6">
        <Heading level={2} className="text-xl font-semibold">
          Sign Up
        </Heading>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create your account to start sharing tools with your community
        </Text>
      </div>

      <FormBuilder
        config={{
          ...registerFormConfig,
          onSuccess: () => onSuccess(),
        }}
      />

      <div className="mt-6 text-center">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
