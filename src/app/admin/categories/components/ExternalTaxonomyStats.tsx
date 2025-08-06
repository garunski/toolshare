"use client";

import { Badge } from "@/primitives/badge";

interface Props {
  stats: {
    totalCategories: number;
    levels: Record<number, number>;
    activeCategories: number;
  } | null;
  loadingStats: boolean;
}

export function ExternalTaxonomyStats({ stats, loadingStats }: Props) {
  return (
    <>
      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Categories
              </p>
              <p className="text-2xl font-bold">
                {loadingStats ? "..." : stats?.totalCategories || 0}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <span className="font-bold text-blue-600">📊</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Categories
              </p>
              <p className="text-2xl font-bold">
                {loadingStats ? "..." : stats?.activeCategories || 0}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <span className="font-bold text-green-600">✓</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Max Level</p>
              <p className="text-2xl font-bold">
                {loadingStats
                  ? "..."
                  : stats?.levels
                    ? Math.max(...Object.keys(stats.levels).map(Number))
                    : 0}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <span className="font-bold text-purple-600">📁</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold">
                {loadingStats ? "..." : "Today"}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <span className="font-bold text-orange-600">🕒</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Distribution */}
      {stats?.levels && (
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-3 font-medium">Category Distribution by Level</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(stats.levels)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, count]) => (
                <div key={level} className="text-center">
                  <Badge color="zinc">Level {level}</Badge>
                  <p className="mt-1 text-lg font-bold">{count}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
