"use client";

import { Text } from "@/primitives/text";

interface ProfileReviewsTabProps {
  userId: string;
}

export function ProfileReviewsTab({ userId }: ProfileReviewsTabProps) {
  return (
    <div className="p-4">
      <Text>Reviews for user {userId}</Text>
      <Text className="text-sm text-zinc-600 dark:text-zinc-400">
        This section will show the user&apos;s reviews.
      </Text>
    </div>
  );
}
