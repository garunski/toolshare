"use client";

import { Text } from "@/primitives/text";
import type { SocialStats } from "@/types/social";

interface SocialHeaderProps {
  socialStats: SocialStats | null;
}

export function SocialHeader({ socialStats }: SocialHeaderProps) {
  if (!socialStats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="text-2xl font-bold">{socialStats.total_friends}</Text>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400">
          Friends
        </Text>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="text-2xl font-bold">{socialStats.total_loans}</Text>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400">Loans</Text>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="text-2xl font-bold">
          {socialStats.average_rating?.toFixed(1) || "N/A"}
        </Text>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400">Rating</Text>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="text-2xl font-bold">{socialStats.trust_score}</Text>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400">
          Trust Score
        </Text>
      </div>
    </div>
  );
}
