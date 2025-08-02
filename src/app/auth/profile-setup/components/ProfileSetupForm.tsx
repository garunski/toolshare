"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { supabase } from "@/common/supabase";
import {
  profileCreationSchema,
  type ProfileCreationData,
} from "@/common/validators/authenticationFormValidator";

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
    <Card>
      <CardHeader>
        <CardTitle>Profile Setup</CardTitle>
        <CardDescription>
          Tell us a bit about yourself to help build trust in the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProfileSetupFormFields isLoading={isLoading} />

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving profile..." : "Complete Setup"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 