import Link from "next/link";

import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface DashboardCardProps {
  title: string;
  description: string;
  content: string;
  buttonText: string;
  href: string;
}

export function DashboardCard({
  title,
  description,
  content,
  buttonText,
  href,
}: DashboardCardProps) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4">
        <Heading level={3} className="text-lg font-semibold">
          {title}
        </Heading>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </Text>
      </div>
      <div>
        <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {content}
        </Text>
        <Link href={href}>
          <Button className="w-full">{buttonText}</Button>
        </Link>
      </div>
    </div>
  );
}
