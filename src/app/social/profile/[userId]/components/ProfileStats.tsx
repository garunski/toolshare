"use client";

import { Text } from "@/primitives/text";
import type { SocialStats } from "@/types/social";

interface ProfileStatsProps {
  socialStats: SocialStats;
}

export function ProfileStats({ socialStats }: ProfileStatsProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <Text className="mb-4 text-lg font-semibold">Statistics</Text>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <Text className="text-2xl font-bold">
            {socialStats.total_friends}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Friends
          </Text>
        </div>
        <div className="text-center">
          <Text className="text-2xl font-bold">{socialStats.total_loans}</Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Loans
          </Text>
        </div>
        <div className="text-center">
          <Text className="text-2xl font-bold">
            {socialStats.average_rating?.toFixed(1) || "N/A"}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Rating
          </Text>
        </div>
        <div className="text-center">
          <Text className="text-2xl font-bold">{socialStats.trust_score}</Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Trust Score
          </Text>
        </div>
      </div>
    </div>
  );
}
