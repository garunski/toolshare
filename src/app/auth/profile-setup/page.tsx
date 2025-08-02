"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

import { ProfileSetupForm } from "./components/ProfileSetupForm";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ToolShare</h1>
          <p className="mt-2 text-sm text-gray-600">Complete your profile</p>
        </div>

        <ProfileSetupForm userId={user.id} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
