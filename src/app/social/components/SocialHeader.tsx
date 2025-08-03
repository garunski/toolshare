"use client";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

import type { SocialStats } from "@/types/social";

interface SocialHeaderProps {
  socialStats: SocialStats | null;
}

export function SocialHeader({ socialStats }: SocialHeaderProps) {
  if (!socialStats) return null;

  return (
    <div className="mb-6">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Your Social Network
          </Heading>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {socialStats.total_friends}
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Friends
              </Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {socialStats.total_loans}
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Loans
              </Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {socialStats.average_rating.toFixed(1)}
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Avg Rating
              </Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {socialStats.trust_score}
              </div>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Trust Score
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
