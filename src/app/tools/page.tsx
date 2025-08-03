"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ToolDataManager } from "@/common/operations/toolDataManager";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"];

export default function ToolsPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserTools = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const result = await ToolDataManager.getUserTools(user.id);

    if (result.success) {
      setTools(result.data || []);
    } else {
      setError(result.error || "Failed to load tools");
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserTools();
    }
  }, [user, loadUserTools]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to view your tools.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tools</h1>
              <p className="text-gray-600">Manage your tool inventory</p>
            </div>
            <Link href="/tools/add">
              <Button>Add New Tool</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p>Loading your tools...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                No tools yet
              </h3>
              <p className="mb-6 text-gray-600">
                Start building your tool collection by adding your first tool.
              </p>
              <Link href="/tools/add">
                <Button>Add Your First Tool</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="mb-4">
                    <Heading level={3} className="text-lg">
                      {tool.name}
                    </Heading>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                      {tool.category}
                    </Text>
                  </div>
                  <div>
                    <Text className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </Text>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tool.is_available
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {tool.is_available ? "Available" : "Unavailable"}
                      </span>
                      <span className="text-sm text-gray-500 capitalize dark:text-gray-400">
                        {tool.condition}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/tools/${tool.id}`} className="flex-1">
                        <Button outline className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/tools/${tool.id}/edit`} className="flex-1">
                        <Button outline className="w-full">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
