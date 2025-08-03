"use client";

import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface SocialHeaderProps {
  title: string;
  description?: string;
}

export function SocialHeader({ title, description }: SocialHeaderProps) {
  return (
    <div className="mb-6">
      <Heading level={2} className="text-xl font-semibold">
        {title}
      </Heading>
      {description && (
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </Text>
      )}
    </div>
  );
}
