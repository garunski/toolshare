"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/common/hooks/useAuth";

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
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Add New Tool</h1>
            <p className="text-gray-600">Share your tools with the community</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AddToolForm userId={user.id} onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
}
