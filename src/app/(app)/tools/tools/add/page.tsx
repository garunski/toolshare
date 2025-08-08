"use client";

import { useRouter } from "next/navigation";

import { AppHeader } from "@/common/components/AppHeader";
import { useAuth } from "@/common/supabase/hooks/useAuth";

import { AddToolForm } from "./components/AddToolForm";

export default function AddToolPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSuccess = () => {
    router.push("/tools");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to add tools.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Add New Tool"
        subtitle="Share your tools with the community"
      />

      <main className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AddToolForm userId={user.id} onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
}
