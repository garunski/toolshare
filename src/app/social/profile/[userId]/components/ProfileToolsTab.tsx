import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

export function ProfileToolsTab() {
  return (
    <div className="mt-6">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Heading level={3} className="text-lg font-semibold">
            Available Tools
          </Heading>
        </div>
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <Text className="font-medium text-zinc-900 dark:text-white">
                Power Drill
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Professional grade, excellent condition
              </Text>
              <Badge color="zinc" className="mt-2">
                Available
              </Badge>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <Text className="font-medium text-zinc-900 dark:text-white">
                Circular Saw
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Heavy duty, perfect for woodworking
              </Text>
              <Badge color="zinc" className="mt-2">
                Available
              </Badge>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <Text className="font-medium text-zinc-900 dark:text-white">
                Ladder
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                6-foot aluminum extension ladder
              </Text>
              <Badge color="zinc" className="mt-2">
                Currently Loaned
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
