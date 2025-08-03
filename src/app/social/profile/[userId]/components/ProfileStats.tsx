"use client";

import { useState, useEffect } from "react";

import { SocialStatsOperations } from "@/common/operations/socialStatsOperations";
import { useAuth } from "@/hooks/useAuth";
import type { SocialStats } from "@/types/social";
import { Text } from "@/primitives/text";

interface ProfileStatsProps {
  userId: string;
}

export function ProfileStats({ userId }: ProfileStatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id, userId]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const result = await SocialStatsOperations.getUserStats(userId);
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading stats...</Text>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>No stats available.</Text>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.total_friends}
          </div>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Friends
          </Text>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.total_loans}
          </div>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Total Loans
          </Text>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.average_rating.toFixed(1)}
          </div>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Avg Rating
          </Text>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.trust_score}
          </div>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Trust Score
          </Text>
        </div>
      </div>
    </div>
  );
}
