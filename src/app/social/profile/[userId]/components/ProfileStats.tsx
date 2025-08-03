"use client";

import { Text } from "@/primitives/text";

import type { SocialStats } from "@/types/social";

interface ProfileStatsProps {
  socialStats: SocialStats;
}

export function ProfileStats({ socialStats }: ProfileStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
          {socialStats.total_friends}
        </div>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Friends
        </Text>
      </div>
      <div className="rounded-lg border border-zinc-950/10 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
          {socialStats.total_loans}
        </div>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Total Loans
        </Text>
      </div>
      <div className="rounded-lg border border-zinc-950/10 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
          {socialStats.average_rating.toFixed(1)}
        </div>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">Rating</Text>
      </div>
      <div className="rounded-lg border border-zinc-950/10 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
          {socialStats.trust_score}
        </div>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Trust Score
        </Text>
      </div>
    </div>
  );
}
