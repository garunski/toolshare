"use client";

import { Text } from "@/primitives/text";

interface ProfileActivityTabProps {
  userId: string;
}

export function ProfileActivityTab({ userId }: ProfileActivityTabProps) {
  return (
    <div className="p-4">
      <Text>Activity for user {userId}</Text>
      <Text className="text-sm text-zinc-600 dark:text-zinc-400">
        This section will show the user&apos;s activity.
      </Text>
    </div>
  );
}
