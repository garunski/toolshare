"use client";

import { FormBuilder } from "@/components/forms";
import { profileSetupFormConfig } from "@/components/forms/configs/profileSetupFormConfig";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface ProfileSetupFormProps {
  userId: string;
  onSuccess: () => void;
}

export function ProfileSetupForm({ userId, onSuccess }: ProfileSetupFormProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-6">
        <Heading level={2} className="text-xl font-semibold">
          Profile Setup
        </Heading>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tell us a bit about yourself to help build trust in the community
        </Text>
      </div>
      
      <FormBuilder
        config={{
          ...profileSetupFormConfig,
          onSuccess: () => onSuccess(),
          additionalData: { userId },
        }}
      />
    </div>
  );
}
