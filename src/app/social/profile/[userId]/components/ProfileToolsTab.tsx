"use client";

import { Text } from "@/primitives/text";

interface ProfileToolsTabProps {
  userId: string;
}

export function ProfileToolsTab({ userId }: ProfileToolsTabProps) {
  return (
    <div className="p-4">
      <Text>Tools for user {userId}</Text>
      <Text className="text-sm text-zinc-600 dark:text-zinc-400">
        This section will show the user&apos;s tools.
      </Text>
    </div>
  );
}
