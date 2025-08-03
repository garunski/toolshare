"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { supabase } from "@/common/supabase";
import {
  profileCreationSchema,
  type ProfileCreationData,
} from "@/common/validators/authenticationFormValidator";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import { ProfileSetupFormFields } from "./ProfileSetupFormFields";

interface ProfileSetupFormProps {
  userId: string;
  onSuccess: () => void;
}

export function ProfileSetupForm({ userId, onSuccess }: ProfileSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileCreationData>({
    resolver: zodResolver(profileCreationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      bio: "",
    },
  });

  const onSubmit = async (data: ProfileCreationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || null,
        address: data.address || null,
        bio: data.bio || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ProfileSetupFormFields isLoading={isLoading} />

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving profile..." : "Complete Setup"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
